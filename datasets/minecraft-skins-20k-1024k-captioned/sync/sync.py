from os import environ
from struct import unpack

from psycopg import connect

from _database import Database


def _vector(embedding: bytes) -> str:
    return f"[{','.join(map(repr, unpack('<1024f', embedding)))}]"


def sync() -> None:
    with Database() as database:
        corpus = database.get_corpus()

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
                id,
                identity,
                identity_text,
                identity_names,
                identity_keywords,
                _vector(identity_embedding),
                appearance,
                appearance_text,
                appearance_keywords,
                appearance_attributes,
                _vector(appearance_embedding),
                _vector(multimodal_embedding),
            ) for (
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
                multimodal_embedding,
            ) in corpus):  # fmt: skip
                copy.write_row(row)
