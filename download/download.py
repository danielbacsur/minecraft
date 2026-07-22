from dataclasses import asdict
import json
from pathlib import Path

from .minecraftskins_net import get_skins_from_minecraftskins_net
from .sync_cache_client import SyncCacheClient

DATASET = Path(__file__).parent.parent / ".dataset"
MINECRAFTSKINS_NET_JSONL = DATASET / "minecraftskins_net.jsonl"


def download() -> None:
    DATASET.mkdir(parents=True, exist_ok=True)

    with SyncCacheClient() as client, MINECRAFTSKINS_NET_JSONL.open("w") as file:
        for skin in get_skins_from_minecraftskins_net():
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
