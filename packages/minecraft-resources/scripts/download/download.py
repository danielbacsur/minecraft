import hashlib
import io
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from zipfile import ZipFile

from tqdm import tqdm


MANIFEST_URL = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
RESOURCE_URL = "https://resources.download.minecraft.net"
DOWNLOAD_DIR = Path(__file__).resolve().parents[2] / "resources"


def _fetch(url: str, sha1: str | None = None) -> bytes:
    with urllib.request.urlopen(url) as response:
        data = response.read()

    if sha1 and hashlib.sha1(data).hexdigest() != sha1:
        raise RuntimeError(url)

    return data


def _json(url: str):
    return json.loads(_fetch(url))


def _save(item: tuple[str, dict]) -> None:
    destination, sha1 = DOWNLOAD_DIR / "assets" / item[0], item[1]["hash"]

    if destination.is_file() and hashlib.sha1(destination.read_bytes()).hexdigest() == sha1:  # fmt: skip
        return

    data = _fetch(f"{RESOURCE_URL}/{sha1[:2]}/{sha1}", sha1)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)


def download() -> None:
    manifest = _json(MANIFEST_URL)
    release = manifest["latest"]["release"]
    version = _json(next(v["url"] for v in manifest["versions"] if v["id"] == release))

    client = version["downloads"]["client"]
    with ZipFile(io.BytesIO(_fetch(client["url"], client["sha1"]))) as archive:
        archive.extractall(
            DOWNLOAD_DIR, [n for n in archive.namelist() if n.startswith("assets/")]
        )

    objects = _json(version["assetIndex"]["url"])["objects"]
    with ThreadPoolExecutor(max_workers=128) as executor:
        futures = [executor.submit(_save, item) for item in objects.items()]
        for future in tqdm(as_completed(futures), total=len(futures)):
            future.result()
