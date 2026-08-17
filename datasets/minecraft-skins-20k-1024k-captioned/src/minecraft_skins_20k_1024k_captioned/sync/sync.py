from pathlib import Path

from datasets import Image, load_dataset


TEXTURES = Path(__file__).parents[5] / "apps/minecraft-frontend/app/api/generate/_textures"  # fmt: skip


def sync() -> None:
    corpus = load_dataset(
        "danielbacsur/minecraft-skins-20k-1024k-captioned", split="train"
    ).select_columns([
        "id",
        "normalized_texture",
    ]).cast_column(
        "normalized_texture",
        Image(decode=False),
    )  # fmt: skip

    TEXTURES.mkdir(parents=True, exist_ok=True)

    for path in TEXTURES.glob("*.png"):
        path.unlink()

    for skin in corpus:
        path = TEXTURES / f"{skin['id']}.png"
        path.write_bytes(skin["normalized_texture"]["bytes"])
