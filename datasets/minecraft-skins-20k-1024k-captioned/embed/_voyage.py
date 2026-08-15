from collections.abc import Sequence
from struct import pack

from PIL import Image
from voyageai.client import Client


_client = Client(max_retries=5)


def _encode(embedding: Sequence[float]) -> bytes:
    return pack("<1024f", *embedding)


def embed_texts(texts: list[str]) -> list[bytes]:
    result = _client.embed(
        texts=texts,
        model="voyage-4-large",
        input_type="document",
        output_dimension=1024,
    )

    return [_encode(embedding) for embedding in result.embeddings]


def embed_images(images: Sequence[Image.Image]) -> list[bytes]:
    result = _client.multimodal_embed(
        inputs=[[image] for image in images],
        model="voyage-multimodal-3.5",
        input_type="document",
        output_dimension=1024,
    )

    return [_encode(embedding) for embedding in result.embeddings]
