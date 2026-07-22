from database import DATABASE, Database

from .minecraftskins_net import get_skins_from_minecraftskins_net
from .sync_cache_client import SyncCacheClient


def download() -> None:
    with SyncCacheClient() as client, Database() as database:
        for skin in get_skins_from_minecraftskins_net():
            image = client.get(skin.download_url).raise_for_status().content

            path = DATABASE.parent / skin.downloaded_texture_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(image)

            database.upsert(
                source=skin.source,
                id=skin.id,
                url=skin.url,
                title=skin.title,
                category=skin.category,
                description=skin.description,
                download_url=skin.download_url,
                downloaded_texture_path=skin.downloaded_texture_path,
            )
