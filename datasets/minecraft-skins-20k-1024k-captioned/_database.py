from sqlite3 import Connection
from typing import Literal

from _dataset import DATASET

DATABASE = DATASET / "database.db"


class Database(Connection):
    def __init__(self) -> None:
        DATASET.mkdir(parents=True, exist_ok=True)

        super().__init__(DATABASE)

        self.autocommit = True

        self.execute("""
            CREATE TABLE IF NOT EXISTS skins (
                id                       TEXT,

                source                   TEXT NOT NULL,
                slug                     TEXT NOT NULL,

                url                      TEXT,
                title                    TEXT,
                category                 TEXT,
                description              TEXT,
                texture_url              TEXT,

                downloaded_texture_path  TEXT,
                normalized_texture_path  TEXT,
                preview_rendering_path   TEXT,
                multiview_rendering_path TEXT,

                identity                 TEXT,
                identity_text            TEXT,
                identity_names           TEXT,
                identity_keywords        TEXT,
                identity_embedding       BLOB,

                appearance               TEXT,
                appearance_text          TEXT,
                appearance_keywords      TEXT,
                appearance_attributes    TEXT,
                appearance_embedding     BLOB,

                multimodal_embedding     BLOB,

                PRIMARY KEY (source, slug)
            )
        """)

    def __exit__(self, *args: object) -> Literal[False]:
        self.close()
        return False

    def upsert(
        self,
        source: str,
        slug: str,
        url: str | None,
        title: str | None,
        category: str | None,
        description: str | None,
        texture_url: str | None,
        downloaded_texture_path: str,
    ) -> None:
        self.execute("""
            INSERT INTO skins (
                source,
                slug,
                url,
                title,
                category,
                description,
                texture_url,
                downloaded_texture_path
            ) VALUES (
                :source,
                :slug,
                :url,
                :title,
                :category,
                :description,
                :texture_url,
                :downloaded_texture_path
            ) ON CONFLICT (source, slug) DO UPDATE SET
                url = excluded.url,
                title = excluded.title,
                category = excluded.category,
                description = excluded.description,
                texture_url = excluded.texture_url,
                downloaded_texture_path = excluded.downloaded_texture_path
        """, {
            "source": source,
            "slug": slug,
            "url": url,
            "title": title,
            "category": category,
            "description": description,
            "texture_url": texture_url,
            "downloaded_texture_path": downloaded_texture_path,
        })  # fmt: skip

    def get_unnormalized_skins(self) -> list[tuple[str, str, str]]:
        return self.execute("""
            SELECT source, slug, downloaded_texture_path
            FROM skins
            WHERE downloaded_texture_path IS NOT NULL
              AND normalized_texture_path IS NULL
            ORDER BY source, slug
        """).fetchall()

    def set_id(self, source: str, slug: str, id: str) -> None:
        self.execute("""
            UPDATE skins
            SET id = :id
            WHERE source = :source AND slug = :slug
        """, {
            "source": source,
            "slug": slug,
            "id": id,
        })  # fmt: skip

    def set_normalized_texture_path(
        self, source: str, slug: str, normalized_texture_path: str
    ) -> None:
        self.execute("""
            UPDATE skins
            SET normalized_texture_path = :normalized_texture_path,
                preview_rendering_path = IIF(normalized_texture_path IS :normalized_texture_path, preview_rendering_path, NULL),
                multiview_rendering_path = IIF(normalized_texture_path IS :normalized_texture_path, multiview_rendering_path, NULL)
            WHERE source = :source AND slug = :slug
        """, {
            "source": source,
            "slug": slug,
            "normalized_texture_path": normalized_texture_path,
        })  # fmt: skip

    def get_unrendered_previews(self) -> list[tuple[str, str, str]]:
        return self.execute("""
            SELECT source, slug, normalized_texture_path
            FROM skins
            WHERE normalized_texture_path IS NOT NULL
              AND preview_rendering_path IS NULL
            ORDER BY source, slug
        """).fetchall()

    def set_preview_rendering_path(
        self, source: str, slug: str, preview_rendering_path: str
    ) -> None:
        self.execute("""
            UPDATE skins
            SET preview_rendering_path = :preview_rendering_path,
                identity = IIF(preview_rendering_path IS :preview_rendering_path, identity, NULL),
                identity_text = IIF(preview_rendering_path IS :preview_rendering_path, identity_text, NULL),
                appearance = IIF(preview_rendering_path IS :preview_rendering_path, appearance, NULL),
                appearance_text = IIF(preview_rendering_path IS :preview_rendering_path, appearance_text, NULL),
                multimodal_embedding = IIF(preview_rendering_path IS :preview_rendering_path, multimodal_embedding, NULL)
            WHERE source = :source AND slug = :slug
        """, {
            "source": source,
            "slug": slug,
            "preview_rendering_path": preview_rendering_path,
        })  # fmt: skip

    def get_unrendered_multiviews(self) -> list[tuple[str, str, str]]:
        return self.execute("""
            SELECT source, slug, normalized_texture_path
            FROM skins
            WHERE normalized_texture_path IS NOT NULL
              AND multiview_rendering_path IS NULL
            ORDER BY source, slug
        """).fetchall()

    def set_multiview_rendering_path(
        self, source: str, slug: str, multiview_rendering_path: str
    ) -> None:
        self.execute("""
            UPDATE skins
            SET multiview_rendering_path = :multiview_rendering_path
            WHERE source = :source AND slug = :slug
        """, {
            "source": source,
            "slug": slug,
            "multiview_rendering_path": multiview_rendering_path,
        })  # fmt: skip

    def set_caption(
        self,
        id: str,
        identity: str,
        identity_text: str,
        identity_names: str,
        identity_keywords: str,
        appearance: str,
        appearance_text: str,
        appearance_keywords: str,
        appearance_attributes: str,
    ) -> None:
        self.execute("""
            UPDATE skins
            SET identity = :identity,
                identity_text = :identity_text,
                identity_names = :identity_names,
                identity_keywords = :identity_keywords,
                appearance = :appearance,
                appearance_text = :appearance_text,
                appearance_keywords = :appearance_keywords,
                appearance_attributes = :appearance_attributes,
                identity_embedding = IIF(identity_text IS :identity_text, identity_embedding, NULL),
                appearance_embedding = IIF(appearance_text IS :appearance_text, appearance_embedding, NULL)
            WHERE id = :id
        """, {
            "id": id,
            "identity": identity,
            "identity_text": identity_text,
            "identity_names": identity_names,
            "identity_keywords": identity_keywords,
            "appearance": appearance,
            "appearance_text": appearance_text,
            "appearance_keywords": appearance_keywords,
            "appearance_attributes": appearance_attributes,
        })  # fmt: skip

    def get_unembedded_identities(self) -> list[tuple[str, str, str]]:
        return self.execute("""
            SELECT source, slug, identity_text
            FROM skins
            WHERE identity IS NOT NULL
              AND identity_embedding IS NULL
            ORDER BY source, slug
        """).fetchall()

    def set_identity_embedding(
        self, source: str, slug: str, identity_embedding: bytes
    ) -> None:
        self.execute("""
            UPDATE skins
            SET identity_embedding = :identity_embedding
            WHERE source = :source AND slug = :slug
        """, {
            "source": source,
            "slug": slug,
            "identity_embedding": identity_embedding,
        })  # fmt: skip

    def get_unembedded_appearances(self) -> list[tuple[str, str, str, str]]:
        return self.execute("""
            SELECT source, slug, appearance_text, appearance_attributes
            FROM skins
            WHERE appearance IS NOT NULL
              AND appearance_embedding IS NULL
            ORDER BY source, slug
        """).fetchall()

    def set_appearance_embedding(
        self, source: str, slug: str, appearance_embedding: bytes
    ) -> None:
        self.execute("""
            UPDATE skins
            SET appearance_embedding = :appearance_embedding
            WHERE source = :source AND slug = :slug
        """, {
            "source": source,
            "slug": slug,
            "appearance_embedding": appearance_embedding,
        })  # fmt: skip

    def get_unembedded_previews(self) -> list[tuple[str, str, str]]:
        return self.execute("""
            SELECT source, slug, preview_rendering_path
            FROM skins
            WHERE preview_rendering_path IS NOT NULL
              AND multimodal_embedding IS NULL
            ORDER BY source, slug
        """).fetchall()

    def set_multimodal_embedding(
        self, source: str, slug: str, multimodal_embedding: bytes
    ) -> None:
        self.execute("""
            UPDATE skins
            SET multimodal_embedding = :multimodal_embedding
            WHERE source = :source AND slug = :slug
        """, {
            "source": source,
            "slug": slug,
            "multimodal_embedding": multimodal_embedding,
        })  # fmt: skip

    def get_skins(self) -> list[tuple]:
        return self.execute("""
            SELECT * FROM skins ORDER BY source, slug
        """).fetchall()
