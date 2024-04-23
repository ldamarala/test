import os
from functools import lru_cache
from typing import List

from celery import Celery
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.database import sessionmanager

env = os.getenv("ENV", "dev")  # Default to "dev" environment if not set
env_files = ['config/.env', f"config/.env.{env}"]


class Settings(BaseSettings):
    PROJECT_NAME: str

    DB_ECHO_LOG: bool = True
    DB_CONNECTION: str
    DB_HOST: str
    DB_PORT: str
    DB_DATABASE: str
    DB_USERNAME: str
    DB_PASSWORD: str

    CELARY_REDIS_BACKEND: str
    CELARY_REDIS_BROKER: str

    SMTP_SERVER: str
    SMTP_PORT: str

    ENCODING: str = 'utf-8'

    OPENAI_API_KEY: str
    MS_SPEECH_API_SERVICE_REGION: str
    MS_SPEECH_API_SUBSCRIPTION_KEY: str

    VIDEO_OUTPUT_DIRECTORY: str

    model_config = SettingsConfigDict(env_file=env_files, extra='ignore')


settings = Settings()

# create celery application
celery_app = Celery(
    "celery",
    backend=settings.CELARY_REDIS_BACKEND,
    broker=settings.CELARY_REDIS_BROKER
)

sessionmanager.init(host="postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}".format(
    DB_USER=settings.DB_USERNAME,
    DB_PASSWORD=settings.DB_USERNAME,
    DB_HOST=settings.DB_HOST,
    DB_PORT=settings.DB_PORT,
    DB_NAME=settings.DB_DATABASE,
))


@lru_cache()
def get_settings():
    return Settings()
