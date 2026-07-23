from PIL import Image
from PIL.Image import Transpose

from database import DATABASE, Database
from uuidv5 import uuidv5

TRANSFORMS = [
    (4, 16, 4, 4, 20, 48),
    (8, 16, 4, 4, 24, 48),
    (0, 20, 4, 12, 24, 52),
    (4, 20, 4, 12, 20, 52),
    (8, 20, 4, 12, 16, 52),
    (12, 20, 4, 12, 28, 52),
    (44, 16, 4, 4, 36, 48),
    (48, 16, 4, 4, 40, 48),
    (40, 20, 4, 12, 40, 52),
    (44, 20, 4, 12, 36, 52),
    (48, 20, 4, 12, 32, 52),
    (52, 20, 4, 12, 44, 52),
]


def _normalize(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")

    if image.size == (64, 64):
        return image.copy()

    if image.size != (64, 32):
        raise ValueError(f"unsupported texture size: {image.size[0]}x{image.size[1]}")

    normalized = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    normalized.paste(image, (0, 0))

    for x, y, width, height, destination_x, destination_y in TRANSFORMS:
        region = image.crop((x, y, x + width, y + height))
        mirrored = region.transpose(Transpose.FLIP_LEFT_RIGHT)
        normalized.paste(mirrored, (destination_x, destination_y))

    return normalized


def normalize() -> None:
    with Database() as database:
        for source, id, downloaded_texture_path in database.get_unnormalized_skins():
            with Image.open(DATABASE.parent / downloaded_texture_path) as image:
                normalized = _normalize(image)

            normalized_texture_path = f"{source}/normalized_textures/{uuidv5(normalized.tobytes())}.png"  # fmt: skip

            path = DATABASE.parent / normalized_texture_path
            path.parent.mkdir(parents=True, exist_ok=True)

            if not path.exists():
                normalized.save(path, optimize=True)

            database.set_normalized_texture_path(source, id, normalized_texture_path)
