from collections.abc import Iterator
from dataclasses import dataclass

from selectolax.parser import HTMLParser

from ._sync_cache_client import SyncCacheClient


@dataclass(frozen=True)
class Skin:
    source = "minecraftskins_net"
    id: str

    url: str
    title: str
    category: str
    description: str
    texture_url: str


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


def get_skins_from_minecraftskins_net(client: SyncCacheClient) -> Iterator[Skin]:
    seen: set[str] = set()

    for category, category_page in _category_pages(client):
        for skin_id, skin_page in _skin_pages(client, category_page, seen):
            yield Skin(
                id=skin_id,
                url=f"https://www.minecraftskins.net/{skin_id}",
                title=skin_page.css("h2.hero-title")[0].text(strip=True),
                category=category,
                description=skin_page.css("p.card-description")[0].text(strip=True),
                texture_url=f"https://www.minecraftskins.net/{skin_id}/download",
            )
