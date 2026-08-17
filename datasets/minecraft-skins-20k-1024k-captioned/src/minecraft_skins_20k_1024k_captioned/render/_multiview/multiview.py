from PIL import Image
from PIL.Image import Resampling

from .._slim import slim
from ._transforms import transforms


def multiview(texture: Image.Image) -> Image.Image:
    texture = texture.convert("RGBA")

    if texture.size != (64, 64):
        raise ValueError()

    canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))

    for sx, sy, sw, sh, dx, dy, dw, dh in transforms(slim(texture)):
        part = texture.crop((sx, sy, sx + sw, sy + sh))
        canvas.alpha_composite(part.resize((dw, dh), Resampling.NEAREST), (dx, dy))

    return canvas
