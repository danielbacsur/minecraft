from collections.abc import Sequence
from struct import pack

from voyageai.client import Client

_client = Client(max_retries=5)


def _encode(embedding: Sequence[float]) -> bytes:
    return pack("<1024f", *embedding)


def _embed_texts(texts: list[str]) -> list[bytes]:
    result = _client.embed(
        texts=texts,
        model="voyage-4-large",
        input_type="document",
        output_dimension=1024,
    )

    return [_encode(embedding) for embedding in result.embeddings]
