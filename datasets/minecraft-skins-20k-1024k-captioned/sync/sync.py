from json import loads
from os import environ
from struct import unpack
from uuid import UUID

from pgvector.psycopg import register_vector
from psycopg import connect
from psycopg.types.json import Jsonb

from _database import Database

COLUMNS = (
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
)

TYPES = [
    "uuid",
    "jsonb",
    "text",
    "text",
    "text",
    "vector",
    "jsonb",
    "text",
    "text",
    "text",
    "vector",
    "vector",
]


def _embedding(embedding: bytes) -> list[float]:
    return list(unpack("<1024f", embedding))


def sync() -> None:
    with Database() as database:
        corpus = database.get_corpus()

    with connect(environ["POSTGRES_URL_NON_POOLING"], autocommit=True) as connection:
        register_vector(connection)

        connection.execute("TRUNCATE corpus.skins")

        with connection.cursor() as cursor:
            with cursor.copy(
                f"COPY corpus.skins ({', '.join(COLUMNS)}) FROM STDIN WITH (FORMAT BINARY)"
            ) as copy:
                copy.set_types(TYPES)

                for (
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
                ) in corpus:
                    copy.write_row((
                        UUID(id),
                        Jsonb(loads(identity)),
                        identity_text,
                        identity_names,
                        identity_keywords,
                        _embedding(identity_embedding),
                        Jsonb(loads(appearance)),
                        appearance_text,
                        appearance_keywords,
                        appearance_attributes,
                        _embedding(appearance_embedding),
                        _embedding(multimodal_embedding),
                    ))  # fmt: skip
