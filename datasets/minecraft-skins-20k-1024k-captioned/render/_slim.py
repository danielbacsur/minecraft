from PIL import Image


def _black(image: Image.Image) -> int:
    colors = image.getcolors(maxcolors=64 * 64) or []
    return sum(count for count, pixel in colors if pixel == (0, 0, 0, 255))


def _slim(texture: Image.Image) -> bool:
    regions = [texture.crop(box) for box in [
        (50, 16, 52, 20), (54, 20, 56, 32), (42, 48, 44, 52), (46, 52, 48, 64),
    ]]  # fmt: skip

    if all(region.getchannel("A").getbbox() is None for region in regions):
        return True

    palettes = [
        {pixel for _, pixel in region.getcolors(maxcolors=64 * 64) or []}
        for region in regions
    ]

    if not all(colors <= {(0, 0, 0, 255), (0, 0, 0, 0)} for colors in palettes):
        return False

    return _black(texture) == sum(_black(region) for region in regions)
