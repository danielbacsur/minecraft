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
                source                   TEXT NOT NULL,
                id                       TEXT NOT NULL,

                url                      TEXT NOT NULL,
                title                    TEXT NOT NULL,
                category                 TEXT NOT NULL,
                description              TEXT NOT NULL,
                texture_url              TEXT NOT NULL,

                downloaded_texture_path  TEXT,
                normalized_texture_path  TEXT,
                multiview_rendering_path TEXT,
                preview_rendering_path   TEXT,

                identity                 TEXT,
                identity_text            TEXT,

                appearance               TEXT,
                appearance_text          TEXT,

                PRIMARY KEY (source, id)
            )
        """)

    def __exit__(self, *args: object) -> Literal[False]:
        self.close()
        return False

    def upsert(
        self,
        source: str,
        id: str,
        url: str,
        title: str,
        category: str,
        description: str,
        texture_url: str,
        downloaded_texture_path: str,
    ) -> None:
        self.execute("""
            INSERT INTO skins (
                source,
                id,
                url,
                title,
                category,
                description,
                texture_url,
                downloaded_texture_path
            ) VALUES (
                :source,
                :id,
                :url,
                :title,
                :category,
                :description,
                :texture_url,
                :downloaded_texture_path
            ) ON CONFLICT (source, id) DO UPDATE SET
                url = excluded.url,
                title = excluded.title,
                category = excluded.category,
                description = excluded.description,
                texture_url = excluded.texture_url,
                downloaded_texture_path = excluded.downloaded_texture_path
        """, {
            "source": source,
            "id": id,
            "url": url,
            "title": title,
            "category": category,
            "description": description,
            "texture_url": texture_url,
            "downloaded_texture_path": downloaded_texture_path,
        })  # fmt: skip

    def get_unnormalized_skins(self) -> list[tuple[str, str, str]]:
        return self.execute("""
            SELECT source, id, downloaded_texture_path
            FROM skins
            WHERE downloaded_texture_path IS NOT NULL
              AND normalized_texture_path IS NULL
            ORDER BY source, id
        """).fetchall()

    def set_normalized_texture_path(
        self, source: str, id: str, normalized_texture_path: str
    ) -> None:
        self.execute("""
            UPDATE skins
            SET normalized_texture_path = :normalized_texture_path
            WHERE source = :source AND id = :id
        """, {
            "source": source,
            "id": id,
            "normalized_texture_path": normalized_texture_path,
        })  # fmt: skip

    def get_unrendered_multiviews(self) -> list[tuple[str, str, str]]:
        return self.execute("""
            SELECT source, id, normalized_texture_path
            FROM skins
            WHERE normalized_texture_path IS NOT NULL
              AND multiview_rendering_path IS NULL
            ORDER BY source, id
        """).fetchall()

    def set_multiview_rendering_path(
        self, source: str, id: str, multiview_rendering_path: str
    ) -> None:
        self.execute("""
            UPDATE skins
            SET multiview_rendering_path = :multiview_rendering_path
            WHERE source = :source AND id = :id
        """, {
            "source": source,
            "id": id,
            "multiview_rendering_path": multiview_rendering_path,
        })  # fmt: skip

    def get_unrendered_previews(self) -> list[tuple[str, str, str]]:
        return self.execute("""
            SELECT source, id, normalized_texture_path
            FROM skins
            WHERE normalized_texture_path IS NOT NULL
              AND preview_rendering_path IS NULL
            ORDER BY source, id
        """).fetchall()

    def set_preview_rendering_path(
        self, source: str, id: str, preview_rendering_path: str
    ) -> None:
        self.execute("""
            UPDATE skins
            SET preview_rendering_path = :preview_rendering_path
            WHERE source = :source AND id = :id
        """, {
            "source": source,
            "id": id,
            "preview_rendering_path": preview_rendering_path,
        })  # fmt: skip

    def get_unidentified_skins(self) -> list[tuple[str, str, str]]:
        # `identity` is null for every skin that depicts no named character, so
        # it cannot say whether one has been looked at yet. `identity_text` is
        # written either way and answers that.
        return self.execute("""
            SELECT source, id, normalized_texture_path
            FROM skins
            WHERE preview_rendering_path IS NOT NULL
              AND identity_text IS NULL
            ORDER BY source, id
        """).fetchall()

    def set_identity(
        self, source: str, id: str, identity: str | None, identity_text: str
    ) -> None:
        self.execute("""
            UPDATE skins
            SET identity = :identity,
                identity_text = :identity_text
            WHERE source = :source AND id = :id
        """, {
            "source": source,
            "id": id,
            "identity": identity,
            "identity_text": identity_text,
        })  # fmt: skip

    def get_undescribed_skins(self) -> list[tuple[str, str, str]]:
        return self.execute("""
            SELECT source, id, normalized_texture_path
            FROM skins
            WHERE preview_rendering_path IS NOT NULL
              AND appearance IS NULL
            ORDER BY source, id
        """).fetchall()

    def set_appearance(
        self, source: str, id: str, appearance: str, appearance_text: str
    ) -> None:
        self.execute("""
            UPDATE skins
            SET appearance = :appearance,
                appearance_text = :appearance_text
            WHERE source = :source AND id = :id
        """, {
            "source": source,
            "id": id,
            "appearance": appearance,
            "appearance_text": appearance_text,
        })  # fmt: skip
