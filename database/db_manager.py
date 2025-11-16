# import os
# import aiosqlite as sql
# from typing import Any
#
# class DatabaseManager:
#     def __init__(self, db_path: str="database/database.db", schema_path: str="database/schema.sql", queries_path: str="database/queries/"):
#         self.db_path = db_path
#         self.schema_path = schema_path
#         self.queries_path = queries_path
#
#         self.conn = sql.connect(self.db_path, check_same_thread=False)
#         self.cursor = self.conn.cursor()
#
#         self._init_db()
#
#     def _init_db(self) -> None:
#         with open(self.schema_path, 'r', encoding="utf-8") as f:
#             self.cursor.executescript(str(f.read()))
#             self.conn.commit()
#
#     def _load_query(self, filename: str) -> str:
#         query_path = os.path.join(self.queries_path, filename)
#         with open(query_path, "r", encoding="utf-8") as f:
#             return f.read()
#
#     def execute(self, query_file: str, params: tuple=(), fetch: bool=False, one: bool=True) -> list[Any] | None | Any:
#         query = self._load_query(query_file)
#
#         self.cursor.execute(query, params)
#         if fetch:
#             if one:
#                 return self.cursor.fetchone()
#             return self.cursor.fetchall()
#
#         self.conn.commit()
#         return None
#
#     def connect(self) -> None:
#         self.conn = sql.connect(self.db_path, check_same_thread=False)
#         self.cursor = self.conn.cursor()
#
#     def close(self) -> None:
#         self.conn.close()

import os
import aiosqlite
from typing import Any


class DatabaseManager:
    def __init__(
        self,
        db_path: str = "database/database.db",
        schema_path: str = "database/schema.sql",
        queries_path: str = "database/queries/",
    ):
        self.db_path = db_path
        self.schema_path = schema_path
        self.queries_path = queries_path
        self.conn: aiosqlite.Connection | None = None

    async def connect(self) -> None:
        """Создает соединение с БД."""
        self.conn = await aiosqlite.connect(self.db_path)
        await self.conn.execute("PRAGMA foreign_keys = ON;")  # Включаем поддержку внешних ключей
        await self.conn.commit()

    async def close(self) -> None:
        """Закрывает соединение."""
        if self.conn:
            await self.conn.close()

    async def init_db(self) -> None:
        """Создает таблицы, если их нет (по schema.sql)."""
        async with aiosqlite.connect(self.db_path) as db:
            with open(self.schema_path, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            await db.executescript(schema_sql)
            await db.commit()

    def _load_query(self, filename: str) -> str:
        """Загружает SQL-запрос из файла."""
        query_path = os.path.join(self.queries_path, filename)
        with open(query_path, "r", encoding="utf-8") as f:
            return f.read()

    async def execute(
        self,
        query_file: str,
        params: tuple | list[tuple] = None,
        fetch: bool = False,
        one: bool = True,
        many: bool = False,
        close: bool = True,
    ) -> list[Any] | None | Any:
        """Выполняет SQL-запрос (из файла)."""
        try:
            # if self.conn is None:
            #     self.conn = await aiosqlite.connect(self.db_path)
            #     # raise ConnectionError("Database is not connected. Call connect() first.")
            # await self.conn.close()
            # self.conn = await aiosqlite.connect(self.db_path)
            await self.close()
            await self.connect()
            query = self._load_query(query_file)

            if many:
                cursor = await self.conn.executemany(query, params)
                if fetch:
                    result = await cursor.fetchall()
                    if close:
                        await self.conn.close()
                    return result
                await self.conn.commit()
                if close:
                    await self.conn.close()
                return None

            else:
                cursor = await self.conn.execute(query, params)
                if fetch:
                    if one:
                        result = await cursor.fetchone()
                    else:
                        result = await cursor.fetchall()

                    await self.conn.commit()
                    if close:
                        await self.conn.close()
                    return result

            await self.conn.commit()
            if close:
                await self.conn.close()
            return None
        except Exception as e:
            await self.conn.close()
            print(f"Ошибка с базой данных! Описание: {e}")
            return -1
