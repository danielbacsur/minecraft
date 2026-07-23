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
