from PIL import Image
from PIL.Image import Transpose

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


def _normalize(texture: Image.Image) -> Image.Image:
    texture = texture.convert("RGBA")

    if texture.size == (64, 64):
        return texture.copy()

    if texture.size != (64, 32):
        raise ValueError(
            f"unsupported texture size: {texture.size[0]}x{texture.size[1]}"
        )

    normalized = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    normalized.paste(texture, (0, 0))

    for x, y, width, height, destination_x, destination_y in TRANSFORMS:
        region = texture.crop((x, y, x + width, y + height))
        mirrored = region.transpose(Transpose.FLIP_LEFT_RIGHT)
        normalized.paste(mirrored, (destination_x, destination_y))

    return normalized
