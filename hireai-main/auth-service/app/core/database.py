import asyncio
import contextlib
from typing import AsyncIterator

from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import (AsyncEngine, AsyncSession,
                                    async_sessionmaker, create_async_engine, async_scoped_session, AsyncConnection)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# class DatabaseSessionManager:
#     def __init__(self):
#         self._engine: AsyncEngine | None = None
#         self._sessionmaker: async_sessionmaker | None = None
#
#     def init(self, host: str, max_pool_size=10):
#         self._engine = create_async_engine(host, pool_size=max_pool_size)
#         self._sessionmaker = async_sessionmaker(autocommit=False, expire_on_commit=False, bind=self._engine)
#
#     async def close(self):
#         if self._engine is None:
#             raise Exception("DatabaseSessionManager is not initialized")
#         await self._engine.dispose()
#         self._engine = None
#         self._sessionmaker = None
#
#     @contextlib.asynccontextmanager
#     async def connect(self) -> AsyncIterator[AsyncConnection]:
#         if self._engine is None:
#             raise Exception("DatabaseSessionManager is not initialized")
#
#         async with self._engine.begin() as connection:
#             try:
#                 yield connection
#             except Exception:
#                 await connection.rollback()
#                 raise
#
#     @contextlib.asynccontextmanager
#     async def session(self) -> AsyncIterator[AsyncSession]:
#         if self._sessionmaker is None:
#             raise Exception("DatabaseSessionManager is not initialized")
#
#         session = self._sessionmaker()
#         try:
#             yield session
#         except Exception:
#             await session.rollback()
#             raise
#         finally:
#             await session.close()
#
#     # Used for testing
#     async def create_all(self, connection: AsyncConnection):
#         await connection.run_sync(Base.metadata.create_all)
#
#     async def drop_all(self, connection: AsyncConnection):
#         await connection.run_sync(Base.metadata.drop_all)

class DatabaseSessionManager:

    def __init__(self):
        self._engine: AsyncEngine | None = None
        self._async_session_maker: async_sessionmaker | None = None
        self._async_scoped_session_maker: async_scoped_session | None = None

    def init(self, host):
        self._engine = create_async_engine(host, echo=True, poolclass=NullPool)
        self._async_session_maker = async_sessionmaker(self._engine, class_=AsyncSession, expire_on_commit=False)
        self._async_scoped_session_maker = async_scoped_session(self._async_session_maker, scopefunc=self._get_task_id)

    @staticmethod
    def _get_task_id():
        task = asyncio.current_task()
        if task is None:
            raise RuntimeError("No current task")
        return id(task)

    @contextlib.asynccontextmanager
    async def connect(self) -> AsyncIterator[AsyncConnection]:
        if self._engine is None:
            raise Exception("DatabaseSessionManager is not initialized")

        async with self._engine.begin() as connection:
            try:
                yield connection
            except Exception:
                await connection.rollback()
                raise

    @contextlib.asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        if self._async_scoped_session_maker is None:
            raise Exception("DatabaseSessionManager is not initialized")

        session = self._async_scoped_session_maker()
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

    async def close(self):
        await self._engine.dispose()


sessionmanager = DatabaseSessionManager()


async def get_db():
    async with sessionmanager.session() as session:
        yield session
