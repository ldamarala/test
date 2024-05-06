import os
from functools import lru_cache
from typing import List

from fastapi.security import OAuth2PasswordBearer
from pydantic_settings import BaseSettings, SettingsConfigDict


env = os.getenv("ENV", "dev")  # Default to "dev" environment if not set
env_files = ['config/.env', f"config/.env.{env}"]


class Settings(BaseSettings):
    ENV: str
    PROJECT_NAME: str
    PROJECT_TITLE: str
    PROJECT_DESCRIPTION: str
    PROJECT_VERSION: str

    DB_ECHO_LOG: bool = True
    DB_CONNECTION: str
    DB_HOST: str
    DB_PORT: str
    DB_DATABASE: str
    DB_USERNAME: str
    DB_PASSWORD: str
    DB_URL: str = ''

    ROOT_PATH: str = ""
    ENCODING: str = 'utf-8'

    API_V1_PREFIX: str = ""
    JWT_ALGORITHM: str
    JWT_ACCESS_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    TOKEN_URL: str

    ACCESS_TOKEN_EXPIRE_SECONDS: int = 60 * 60 * 24 * 1
    REFRESH_TOKEN_EXPIRE_SECONDS: int = 60 * 60 * 24 * 30
    BACKEND_CORS_ORIGINS: List[str] = ['*']


    LOG_LEVEL: str = "DEBUG"
    LOG_FORMAT: str = (
        "time: {time:YYYY-MM-DD HH:mm:ss Z} | "
        "level: {level} | "
        "request_id: {extra[request_id]} | "
        "user: {extra[user]} | "
        "user_host: {extra[user_host]} | "
        "user_agent: {extra[user_agent]} | "
        "url: {extra[path]} | "
        "method: {extra[method]} | "
        "request_data: {extra[request_data]} | "
        "response_data: {extra[response_data]} | "
        "response_time: {extra[response_time]} | "
        "response_code: {extra[response_code]} | "
        "message: {message} | "
        "exception: {exception}"
    )

    AUTH_EXCLUDE_PATHS: List[str] = [
        "/docs",
        "/openapi",
        "/token-form",
        "/token",
        "/token/refresh",
        "/register",
        "/user/new_user",
        
    ]

    model_config = SettingsConfigDict(env_file=env_files, extra='ignore')


settings = Settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=settings.TOKEN_URL)


@lru_cache()
def get_settings():
    return Settings()
