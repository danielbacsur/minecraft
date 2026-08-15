from os import environ

from datasets import load_dataset
from psycopg import connect


def _vector(embedding: list[float]) -> str:
    return f"[{','.join(map(repr, embedding))}]"


def index() -> None:
    corpus = load_dataset(
        "danielbacsur/minecraft-skins-20k-1024k-captioned", split="train"
    ).select_columns([
        "id",
        "identity",
        "identity_text",
        "identity_names",
        "identity_keywords",
        "identity_embedding",
        "appearance",
        "appearance_text",
        "appearance_keywords",
        "appearance_attributes",
        "appearance_embedding",
        "multimodal_embedding",
    ])  # fmt: skip

    with connect(environ["POSTGRES_URL_NON_POOLING"], autocommit=True) as connection:
        connection.execute("TRUNCATE corpus.skins")

        with connection.cursor() as cursor, cursor.copy("""
            COPY corpus.skins (
                id,
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
                multimodal_embedding
            ) FROM STDIN
        """) as copy:  # fmt: skip
            for row in ((
                skin["id"],
                skin["identity"],
                skin["identity_text"],
                skin["identity_names"],
                skin["identity_keywords"],
                _vector(skin["identity_embedding"]),
                skin["appearance"],
                skin["appearance_text"],
                skin["appearance_keywords"],
                skin["appearance_attributes"],
                _vector(skin["appearance_embedding"]),
                _vector(skin["multimodal_embedding"]),
            ) for skin in corpus):  # fmt: skip
                copy.write_row(row)
