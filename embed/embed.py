from collections.abc import Iterator

from _database import Database

from ._voyage import _embed_texts


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
