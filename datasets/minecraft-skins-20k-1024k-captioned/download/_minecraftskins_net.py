from collections.abc import Iterator
from dataclasses import dataclass

from selectolax.parser import HTMLParser

from ._sync_cache_client import SyncCacheClient


@dataclass(frozen=True)
class Skin:
    source = "minecraftskins_net"
    slug: str

    url: str | None
    title: str | None
    category: str | None
    description: str | None
    texture_url: str | None


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
        slug = link.attrs.sget("href").strip("/")

        if slug in seen:
            continue

        seen.add(slug)
        yield slug, HTMLParser(_get(client, f"/{slug}"))


def get_skins_from_minecraftskins_net(client: SyncCacheClient) -> Iterator[Skin]:
    seen: set[str] = set()

    for category, category_page in _category_pages(client):
        for slug, skin_page in _skin_pages(client, category_page, seen):
            yield Skin(
                slug=slug,
                url=f"https://www.minecraftskins.net/{slug}",
                title=skin_page.css("h2.hero-title")[0].text(strip=True) or None,
                category=category,
                description=skin_page.css("p.card-description")[0].text(strip=True) or None,
                texture_url=f"https://www.minecraftskins.net/{slug}/download",
            )  # fmt: skip
