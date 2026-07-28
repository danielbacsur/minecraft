from PIL import Image
from PIL.Image import Resampling

from .._slim import _slim
from ._transforms import _transforms


def _preview(texture: Image.Image) -> Image.Image:
    texture = texture.convert("RGBA")

    if texture.size != (64, 64):
        raise ValueError()

    canvas = Image.new("RGBA", (832, 320), (0, 0, 0, 0))

    for sx, sy, sw, sh, dx, dy, dw, dh in _transforms(_slim(texture)):
        part = texture.crop((sx, sy, sx + sw, sy + sh))
        canvas.alpha_composite(part.resize((dw, dh), Resampling.NEAREST), (dx, dy))

    background = Image.new("RGBA", (832, 320), (128, 128, 128, 255))

    return Image.alpha_composite(background, canvas)
