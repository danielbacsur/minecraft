from json import loads
from pathlib import Path

from _database import Database

from ._transforms import columns

CAPTIONS = Path(__file__).parent / "captions.jsonl"


def caption() -> None:
    with Database() as database, CAPTIONS.open("r", encoding="utf-8") as captions:
        for caption in captions:
            skin = loads(caption)

            database.set_caption(skin["id"], **columns(skin))
