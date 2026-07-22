from collections.abc import Iterator
from dataclasses import asdict, dataclass
import json
from pathlib import Path

from hishel import BaseFilter, FilterPolicy, Response
from hishel.httpx import SyncCacheTransport
from httpx import Client, HTTPTransport
from selectolax.parser import HTMLParser


DATASET = Path(__file__).parent / ".dataset"
MINECRAFTSKINS_NET_JSONL = DATASET / "minecraftskins_net.jsonl"


@dataclass
class Skin:
    source = "minecraftskins_net"
    id: str

    url: str
    title: str
    category: str
    description: str
    download_url: str

    downloaded_texture_path: str


class SuccessfulResponsesOnly(BaseFilter[Response]):
    def apply(self, item: Response, body: bytes | None) -> bool:
        return 200 <= item.status_code < 300

    def needs_body(self) -> bool:
        return False


class SyncCacheClient(Client):
    def __init__(self, **kwargs) -> None:
        kwargs.setdefault("follow_redirects", True)
        kwargs.setdefault("timeout", 30)
        kwargs.setdefault(
            "transport",
            SyncCacheTransport(
                next_transport=HTTPTransport(retries=3),
                policy=FilterPolicy(response_filters=[SuccessfulResponsesOnly()]),
            ),
        )

        super().__init__(**kwargs)


def _get(client: SyncCacheClient, path: str) -> str:
    return client.get(f"https://www.minecraftskins.net{path}").raise_for_status().text


def _category_pages(client: SyncCacheClient) -> Iterator[tuple[str, HTMLParser]]:
    homepage = HTMLParser(_get(client, "/"))

    for link in homepage.css('nav.main a[href^="/category/"]'):
        path = link.attrs.sget("href")
        category = path.removeprefix("/category/")

        while path:
            html = HTMLParser(_get(client, path))
            yield category, html

            next_page = html.css_first("a.next-page")
            path = next_page.attrs.sget("href") if next_page else None


def _skin_pages(
    client: SyncCacheClient, category_page: HTMLParser, seen: set[str]
) -> Iterator[tuple[str, HTMLParser]]:
    for link in category_page.css("div.card a.panel-link"):
        skin_id = link.attrs.sget("href").strip("/")

        if skin_id in seen:
            continue

        seen.add(skin_id)
        yield skin_id, HTMLParser(_get(client, f"/{skin_id}"))


def _get_skins_from_minecraftskins_net() -> Iterator[Skin]:
    seen: set[str] = set()

    with SyncCacheClient() as client:
        for category, category_page in _category_pages(client):
            for skin_id, skin_page in _skin_pages(client, category_page, seen):
                yield Skin(
                    id=skin_id,
                    url=f"https://www.minecraftskins.net/{skin_id}",
                    title=skin_page.css("h2.hero-title")[0].text(strip=True),
                    category=category,
                    description=skin_page.css("p.card-description")[0].text(strip=True),
                    download_url=f"https://www.minecraftskins.net/{skin_id}/download",
                    downloaded_texture_path=f"{Skin.source}/downloaded_textures/{skin_id}.png",
                )


def main() -> None:
    DATASET.mkdir(parents=True, exist_ok=True)

    with SyncCacheClient() as client, MINECRAFTSKINS_NET_JSONL.open("w") as file:
        for skin in _get_skins_from_minecraftskins_net():
            image = client.get(skin.download_url).raise_for_status().content

            path = DATASET / skin.downloaded_texture_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(image)

            file.write(json.dumps(asdict(skin), ensure_ascii=False) + "\n")
            file.flush()

    with MINECRAFTSKINS_NET_JSONL.open("r") as file:
        skins = list(json.loads(line) for line in file)

    skins.sort(key=lambda skin: skin["id"])

    with MINECRAFTSKINS_NET_JSONL.open("w") as file:
        for skin in skins:
            file.write(json.dumps(skin, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
