import os
import sqlite3 as sql
from typing import Any

class DatabaseManager:
    def __init__(self, db_path: str="database/database.db", schema_path: str="database/schema.sql", queries_path: str="database/queries/"):
        self.db_path = db_path
        self.schema_path = schema_path
        self.queries_path = queries_path

        self.conn = sql.connect(self.db_path, check_same_thread=False)
        self.cursor = self.conn.cursor()

        self._init_db()

    def _init_db(self) -> None:
        with open(self.schema_path, 'r', encoding="utf-8") as f:
            self.cursor.executescript(str(f.read()))
            self.conn.commit()

    def _load_query(self, filename: str) -> str:
        query_path = os.path.join(self.queries_path, filename)
        with open(query_path, "r", encoding="utf-8") as f:
            return f.read()

    def execute(self, query_file: str, params: tuple[Any]=(), fetch: bool=False, one: bool=True) -> list[Any] | None | Any:
        query = self._load_query(query_file)

        self.cursor.execute(query, params)
        if fetch:
            if one:
                return self.cursor.fetchone()
            return self.cursor.fetchall()

        self.conn.commit()
        return None

    def connect(self) -> None:
        self.conn = sql.connect(self.db_path, check_same_thread=False)
        self.cursor = self.conn.cursor()

    def close(self) -> None:
        self.conn.close()
