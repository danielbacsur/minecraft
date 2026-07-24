from io import BytesIO

from PIL import Image

from _database import Database
from _dataset import DATASET
from _uuidv5 import uuidv5

from ._normalize import _normalize


def normalize() -> None:
    with Database() as database:
        for source, id, downloaded_texture_path in database.get_unnormalized_skins():
            with Image.open(DATASET / downloaded_texture_path) as texture:
                normalized = _normalize(texture)

            buffer = BytesIO()
            normalized.save(buffer, format="PNG", optimize=True)
            texture = buffer.getvalue()

            normalized_texture_path = f"normalized/{uuidv5(texture)}.png"

            path = DATASET / normalized_texture_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(texture)

            database.set_normalized_texture_path(source, id, normalized_texture_path)
