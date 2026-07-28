from collections.abc import Iterator

from PIL import Image

from _database import Database
from _dataset import DATASET

from ._voyage import _embed_images, _embed_texts


def _batches[T](values: list[T], size: int) -> Iterator[list[T]]:
    for start in range(0, len(values), size):
        yield values[start : start + size]


def embed() -> None:
    with Database() as database:
        identities = database.get_unembedded_identities()
        for batch in _batches(identities, 64):
            embeddings = _embed_texts([text for _, _, text in batch])

            for (source, id, _), embedding in zip(batch, embeddings):
                database.set_identity_embedding(source, id, embedding)

        appearances = database.get_unembedded_appearances()
        for batch in _batches(appearances, 64):
            embeddings = _embed_texts([text for _, _, text in batch])

            for (source, id, _), embedding in zip(batch, embeddings):
                database.set_appearance_embedding(source, id, embedding)

        previews = database.get_unembedded_previews()
        for batch in _batches(previews, 16):
            images = [Image.open(DATASET / path) for _, _, path in batch]
            embeddings = _embed_images(images)

            for image in images:
                image.close()

            for (source, id, _), embedding in zip(batch, embeddings):
                database.set_multimodal_embedding(source, id, embedding)
