from pathlib import Path
from sqlite3 import Connection
from typing import Literal

DATABASE = Path(__file__).parent / ".dataset" / "database.db"


class Database(Connection):
    def __init__(self) -> None:
        DATABASE.parent.mkdir(parents=True, exist_ok=True)

        super().__init__(DATABASE)

        self.autocommit = True

        self.execute(
            """
            CREATE TABLE IF NOT EXISTS skins (
                source                  TEXT NOT NULL,
                id                      TEXT NOT NULL,

                url                     TEXT NOT NULL,
                title                   TEXT NOT NULL,
                category                TEXT NOT NULL,
                description             TEXT NOT NULL,
                download_url            TEXT NOT NULL,

                downloaded_texture_path TEXT,
                normalized_texture_path TEXT,
                rendered_multiview_path TEXT,

                PRIMARY KEY (source, id)
            )
            """
        )

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
        download_url: str,
        downloaded_texture_path: str,
    ) -> None:
        self.execute(
            """
            INSERT INTO skins (
                source,
                id,

                url,
                title,
                category,
                description,
                download_url,

                downloaded_texture_path
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (source, id) DO UPDATE SET
                url = excluded.url,
                title = excluded.title,
                category = excluded.category,
                description = excluded.description,
                download_url = excluded.download_url,

                downloaded_texture_path = excluded.downloaded_texture_path
            """,
            (
                source,
                id,
                url,
                title,
                category,
                description,
                download_url,
                downloaded_texture_path,
            ),
        )

    def get_unnormalized_skins(self) -> list[tuple[str, str, str]]:
        return self.execute(
            """
            SELECT source, id, downloaded_texture_path
            FROM skins
            WHERE downloaded_texture_path IS NOT NULL
            AND normalized_texture_path IS NULL
            """
        ).fetchall()

    def set_normalized_texture_path(
        self, source: str, id: str, normalized_texture_path: str
    ) -> None:
        self.execute(
            """
            UPDATE skins
            SET normalized_texture_path = ?
            WHERE source = ? AND id = ?
            """,
            (normalized_texture_path, source, id),
        )

    def get_unrendered_skins(self) -> list[tuple[str, str, str]]:
        return self.execute(
            """
            SELECT source, id, normalized_texture_path
            FROM skins
            WHERE normalized_texture_path IS NOT NULL
            AND rendered_multiview_path IS NULL
            """
        ).fetchall()

    def set_rendered_multiview_path(
        self, source: str, id: str, rendered_multiview_path: str
    ) -> None:
        self.execute(
            """
            UPDATE skins
            SET rendered_multiview_path = ?
            WHERE source = ? AND id = ?
            """,
            (rendered_multiview_path, source, id),
        )
