from io import BytesIO

from PIL import Image

from _database import DATABASE, Database
from _uuidv5 import uuidv5

from ._render import _render


def render() -> None:
    with Database() as database:
        for source, id, normalized_texture_path in database.get_unrendered_skins():
            with Image.open(DATABASE.parent / normalized_texture_path) as texture:
                rendering = _render(texture)

            buffer = BytesIO()
            rendering.save(buffer, format="PNG", optimize=True)
            multiview = buffer.getvalue()

            rendered_multiview_path = f"{source}/rendered_multiviews/{uuidv5(multiview)}.png"  # fmt: skip

            path = DATABASE.parent / rendered_multiview_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(multiview)

            database.set_rendered_multiview_path(source, id, rendered_multiview_path)
