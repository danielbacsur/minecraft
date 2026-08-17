from collections.abc import Iterator

from PIL import Image

from .._database import Database
from .._dataset import DATASET
from ._voyage import embed_images, embed_texts


def _batches[T](values: list[T], size: int) -> Iterator[list[T]]:
    for start in range(0, len(values), size):
        yield values[start : start + size]


def _document(*parts: str) -> str:
    return "\n".join(part for part in parts if part)


def _flatten(image: Image.Image) -> Image.Image:
    background = Image.new("RGBA", image.size, (128, 128, 128, 255))
    return Image.alpha_composite(background, image.convert("RGBA")).convert("RGB")


def embed() -> None:
    with Database() as database:
        identities = database.get_unembedded_identities()
        for batch in _batches(identities, 64):
            texts = [_document(text) for _, _, text in batch]
            embeddings = embed_texts(texts)

            for (source, slug, _), embedding in zip(batch, embeddings):
                database.set_identity_embedding(source, slug, embedding)

        appearances = database.get_unembedded_appearances()
        for batch in _batches(appearances, 64):
            texts = [_document(text, attributes) for _, _, text, attributes in batch]
            embeddings = embed_texts(texts)
            for (source, slug, _, _), embedding in zip(batch, embeddings):
                database.set_appearance_embedding(source, slug, embedding)

        previews = database.get_unembedded_previews()
        for batch in _batches(previews, 16):
            images = [Image.open(DATASET / path) for _, _, path in batch]
            embeddings = embed_images([_flatten(image) for image in images])

            for image in images:
                image.close()

            for (source, slug, _), embedding in zip(batch, embeddings):
                database.set_multimodal_embedding(source, slug, embedding)
