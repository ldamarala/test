from fastapi import FastAPI

from app.api.auth.routes import auth_router
from app.api.v1.current_user import router as current_user_v1


def init_routers(app_: FastAPI) -> None:
    app_.include_router(auth_router)
    app_.include_router(current_user_v1, prefix="/user")

