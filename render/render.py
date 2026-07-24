from io import BytesIO

from PIL import Image

from _database import Database
from _dataset import DATASET
from _uuidv5 import uuidv5

from ._render import _render


def render() -> None:
    with Database() as database:
        for source, id, normalized_texture_path in database.get_unrendered_skins():
            with Image.open(DATASET / normalized_texture_path) as texture:
                rendered = _render(texture)

            buffer = BytesIO()
            rendered.save(buffer, format="PNG", optimize=True)
            multiview = buffer.getvalue()

            rendered_multiview_path = f"rendered/{uuidv5(multiview)}.png"

            path = DATASET / rendered_multiview_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(multiview)

            database.set_rendered_multiview_path(source, id, rendered_multiview_path)
