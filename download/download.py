from _database import DATABASE, Database
from _uuidv5 import uuidv5

from ._minecraftskins_net import get_skins_from_minecraftskins_net
from ._sync_cache_client import SyncCacheClient


def download() -> None:
    with SyncCacheClient() as client, Database() as database:
        for skin in get_skins_from_minecraftskins_net():
            image = client.get(skin.download_url).raise_for_status().content

            downloaded_texture_path = f"{skin.source}/downloaded_textures/{uuidv5(image)}.png"  # fmt: skip

            path = DATABASE.parent / downloaded_texture_path
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
                downloaded_texture_path=downloaded_texture_path,
            )
