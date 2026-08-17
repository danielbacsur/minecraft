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
DOWNLOAD_DIR = Path(__file__).resolve().parents[3] / "resources"


def _fetch(url: str, sha1: str | None = None) -> bytes:
    with urllib.request.urlopen(url) as response:
        data = response.read()

    if sha1 and hashlib.sha1(data).hexdigest() != sha1:
        raise RuntimeError(url)

    return data


def _json(url: str):
    return json.loads(_fetch(url))


def _save(item: tuple[str, dict]) -> None:
    destination, sha1 = DOWNLOAD_DIR / "client" / item[0], item[1]["hash"]

    if destination.is_file() and hashlib.sha1(destination.read_bytes()).hexdigest() == sha1:  # fmt: skip
        return

    data = _fetch(f"{RESOURCE_URL}/{sha1[:2]}/{sha1}", sha1)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)


def _unpack(archive: ZipFile, prefix: str, directory: str) -> None:
    for name in archive.namelist():
        if not name.startswith(prefix) or name.endswith("/"):
            continue

        destination = DOWNLOAD_DIR / directory / name.removeprefix(prefix)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(archive.read(name))


def _bundled(archive: ZipFile) -> ZipFile:
    name = next(n for n in archive.namelist() if n.startswith("META-INF/versions/") and n.endswith(".jar"))  # fmt: skip

    return ZipFile(io.BytesIO(archive.read(name)))


def download() -> None:
    manifest = _json(MANIFEST_URL)
    release = manifest["latest"]["release"]
    version = _json(next(v["url"] for v in manifest["versions"] if v["id"] == release))

    client = version["downloads"]["client"]
    with ZipFile(io.BytesIO(_fetch(client["url"], client["sha1"]))) as archive:
        _unpack(archive, "assets/", "client")
        (DOWNLOAD_DIR / "version.json").write_bytes(archive.read("version.json"))

    server = version["downloads"]["server"]
    with (
        ZipFile(io.BytesIO(_fetch(server["url"], server["sha1"]))) as archive,
        _bundled(archive) as bundled,
    ):
        _unpack(bundled, "data/", "server")

    objects = _json(version["assetIndex"]["url"])["objects"]
    with ThreadPoolExecutor(max_workers=128) as executor:
        futures = [executor.submit(_save, item) for item in objects.items()]
        for future in tqdm(as_completed(futures), total=len(futures)):
            future.result()
