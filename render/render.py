from io import BytesIO

from PIL import Image

from _database import Database
from _dataset import DATASET
from _uuidv5 import uuidv5

from ._multiview import _multiview


def render() -> None:
    with Database() as database:
        for source, id, normalized_texture_path in database.get_unrendered_skins():
            with Image.open(DATASET / normalized_texture_path) as texture:
                rendered = _multiview(texture)

            buffer = BytesIO()
            rendered.save(buffer, format="PNG", optimize=True)
            data = buffer.getvalue()

            rendered_multiview_path = f"rendered/{uuidv5(data)}.png"

            path = DATASET / rendered_multiview_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

            database.set_rendered_multiview_path(source, id, rendered_multiview_path)
