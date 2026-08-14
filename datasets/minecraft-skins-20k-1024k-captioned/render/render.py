from io import BytesIO

from PIL import Image

from _database import Database
from _dataset import DATASET
from _uuidv5 import uuidv5

from ._multiview import _multiview
from ._preview import _preview


def _store(rendering: Image.Image, directory: str) -> str:
    buffer = BytesIO()
    rendering.save(buffer, format="PNG", optimize=True)
    data = buffer.getvalue()

    rendering_path = f"{directory}/{uuidv5(data)}.png"

    path = DATASET / rendering_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)

    return rendering_path


def render() -> None:
    with Database() as database:
        for source, slug, normalized_texture_path in database.get_unrendered_previews():
            with Image.open(DATASET / normalized_texture_path) as texture:
                preview = _preview(texture)

            preview_rendering_path = _store(preview, "preview_renderings")
            database.set_preview_rendering_path(source, slug, preview_rendering_path)

        for (source, slug, normalized_texture_path) in database.get_unrendered_multiviews():  # fmt: skip
            with Image.open(DATASET / normalized_texture_path) as texture:
                multiview = _multiview(texture)

            multiview_rendering_path = _store(multiview, "multiview_renderings")
            database.set_multiview_rendering_path(source, slug, multiview_rendering_path)  # fmt: skip
