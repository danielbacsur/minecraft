from io import BytesIO

from PIL import Image

from _database import Database
from _dataset import DATASET
from _uuidv5 import uuidv5

from ._normalize import _normalize


def normalize() -> None:
    with Database() as database:
        for source, slug, downloaded_texture_path in database.get_unnormalized_skins():
            with Image.open(DATASET / downloaded_texture_path) as texture:
                texture = _normalize(texture)

            buffer = BytesIO()
            texture.save(buffer, format="PNG", optimize=True)
            data = buffer.getvalue()

            id = uuidv5(data)
            normalized_texture_path = f"normalized_textures/{id}.png"

            path = DATASET / normalized_texture_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

            database.set_id(source, slug, id)
            database.set_normalized_texture_path(source, slug, normalized_texture_path)
