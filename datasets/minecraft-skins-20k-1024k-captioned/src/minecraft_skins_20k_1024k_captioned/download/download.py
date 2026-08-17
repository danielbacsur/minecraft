from .._database import Database
from .._dataset import DATASET
from .._uuidv5 import uuidv5
from ._minecraftskins_net import get_skins_from_minecraftskins_net
from ._sync_cache_client import SyncCacheClient


def download() -> None:
    with SyncCacheClient() as client, Database() as database:
        for skin in get_skins_from_minecraftskins_net(client):
            data = client.get(skin.texture_url).raise_for_status().content

            downloaded_texture_path = f"downloaded_textures/{uuidv5(data)}.png"

            path = DATASET / downloaded_texture_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

            database.upsert(
                source=skin.source,
                slug=skin.slug,
                url=skin.url,
                title=skin.title,
                category=skin.category,
                description=skin.description,
                texture_url=skin.texture_url,
                downloaded_texture_path=downloaded_texture_path,
            )
