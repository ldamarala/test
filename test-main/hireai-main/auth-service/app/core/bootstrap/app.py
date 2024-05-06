from fastapi import FastAPI

from app.core.bootstrap.handlers import init_handlers
from app.core.bootstrap.listeners import init_listeners
from app.core.bootstrap.middlewares import init_middlewares
from app.core.bootstrap.routers import init_routers
from app.core.config import Settings, get_settings


# from app.core.bootstrap.app import get_settings, Settings
# from app.core.bootstrap.app import sessionmanager


# from .bootstrap.middlewares import init_middlewares
# from .bootstrap.listeners import init_listeners
# from .bootstrap.handlers import init_handlers
# from .routers import init_routers
# from .configs import Settings, get_settings


def create_app() -> FastAPI:
    settings: Settings = get_settings()

    app_ = FastAPI(
        title=settings.PROJECT_TITLE,
        description=settings.PROJECT_DESCRIPTION,
        version=settings.PROJECT_VERSION,
        root_path=settings.ROOT_PATH,
        docs_url=None if settings.ENV == "prod" else "/docs",
        redoc_url=None if settings.ENV == "prod" else "/redoc",
    )

    # sessionmanager.init(host="postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}".format(
    #     DB_USER=settings.DB_USERNAME,
    #     DB_PASSWORD=settings.DB_USERNAME,
    #     DB_HOST=settings.DB_HOST,
    #     DB_PORT=settings.DB_PORT,
    #     DB_NAME=settings.DB_DATABASE,
    # ))

    # Initializing required dependencies
    init_listeners(app_=app_)
    init_handlers(app_=app_)
    init_middlewares(app_=app_)
    init_routers(app_=app_)

    return app_
