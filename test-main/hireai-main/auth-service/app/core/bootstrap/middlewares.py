from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_oauth2.client import OAuth2Client
from fastapi_oauth2.config import OAuth2Config
from fastapi_oauth2.middleware import OAuth2Middleware

from app.api.auth.auth_backend import AuthBackend
from app.core.config import Settings, get_settings, settings
from app.core.middlewares.auth import AuthenticationMiddleware
from app.core.middlewares.logging import LoggingMiddleware
from app.core.middlewares.request_id import RequestIdMiddleware


def init_middlewares(app_: FastAPI) -> None:
    app_.add_middleware(LoggingMiddleware)
    app_.add_middleware(AuthenticationMiddleware, backend=AuthBackend(
        prefix=f"{settings.API_V1_PREFIX}",
        exclude_paths=settings.AUTH_EXCLUDE_PATHS if settings.AUTH_EXCLUDE_PATHS else [],
    ))
    app_.add_middleware(RequestIdMiddleware)

    app_.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )