from struct import unpack

from datasets import Dataset, Features, Image, Sequence, Value

from _database import Database
from _dataset import DATASET


def _image(path: str) -> str:
    return str(DATASET / path)


def _embedding(embedding: bytes | None) -> list[float] | None:
    return list(unpack("<1024f", embedding)) if embedding else None


def push() -> None:
    with Database() as database:
        skins = database.get_skins()

    dataset = Dataset.from_list([{
        "id": id,
        "source": source,
        "slug": slug,
        "url": url,
        "title": title,
        "category": category,
        "description": description,
        "texture_url": texture_url,
        "downloaded_texture": _image(downloaded_texture_path),
        "normalized_texture": _image(normalized_texture_path),
        "preview_rendering": _image(preview_rendering_path),
        "multiview_rendering": _image(multiview_rendering_path),
        "identity": identity,
        "identity_text": identity_text,
        "identity_names": identity_names,
        "identity_keywords": identity_keywords,
        "identity_embedding": _embedding(identity_embedding),
        "appearance": appearance,
        "appearance_text": appearance_text,
        "appearance_keywords": appearance_keywords,
        "appearance_attributes": appearance_attributes,
        "appearance_embedding": _embedding(appearance_embedding),
        "multimodal_embedding": _embedding(multimodal_embedding),
    } for (
        id,
        source,
        slug,
        url,
        title,
        category,
        description,
        texture_url,
        downloaded_texture_path,
        normalized_texture_path,
        preview_rendering_path,
        multiview_rendering_path,
        identity,
        identity_text,
        identity_names,
        identity_keywords,
        identity_embedding,
        appearance,
        appearance_text,
        appearance_keywords,
        appearance_attributes,
        appearance_embedding,
        multimodal_embedding,
    ) in skins], Features({
        "id": Value("string"),
        "source": Value("string"),
        "slug": Value("string"),
        "url": Value("string"),
        "title": Value("string"),
        "category": Value("string"),
        "description": Value("string"),
        "texture_url": Value("string"),
        "downloaded_texture": Image(),
        "normalized_texture": Image(),
        "preview_rendering": Image(),
        "multiview_rendering": Image(),
        "identity": Value("string"),
        "identity_text": Value("string"),
        "identity_names": Value("string"),
        "identity_keywords": Value("string"),
        "identity_embedding": Sequence(Value("float32")),
        "appearance": Value("string"),
        "appearance_text": Value("string"),
        "appearance_keywords": Value("string"),
        "appearance_attributes": Value("string"),
        "appearance_embedding": Sequence(Value("float32")),
        "multimodal_embedding": Sequence(Value("float32")),
    }))  # fmt: skip

    dataset.push_to_hub(
        "danielbacsur/minecraft-skins-20k-1024k-captioned", split="train"
    )
