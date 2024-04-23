from fastapi import FastAPI

from app.core.config import settings
from app.core.database import sessionmanager
from app.core.logging.logger import logger


def init_listeners(app_: FastAPI) -> None:
    @app_.on_event("startup")
    async def startup():
        sessionmanager.init(host="postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}".format(
            DB_USER=settings.DB_USERNAME,
            DB_PASSWORD=settings.DB_USERNAME,
            DB_HOST=settings.DB_HOST,
            DB_PORT=settings.DB_PORT,
            DB_NAME=settings.DB_DATABASE,
        ))
        logger.info("Database connected")

    @app_.on_event("shutdown")
    async def shutdown():
        await sessionmanager.close()
        logger.info("Database disconnected")
