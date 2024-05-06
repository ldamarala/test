from typing import Annotated

import jwt
from datetime import datetime, timedelta

from fastapi import Depends
from pydantic import parse_obj_as
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas.requests import LoginRequest, RefreshTokenRequest
from .schemas.exceptions import (
    PasswordDoesNotMatchException,
    DecodeTokenException,
    ExpiredTokenException,
    InvalidTokenException, UserNotFoundException
)
from .schemas.responses import TokenData, TokenPayload
from ...core.config import get_settings
from ...core.database import get_db
from ...core.utils import verify_password
from ...models.user import User


class AuthService:
    def __init__(self):
        self.settings = get_settings()

    async def get_user_from_access_token(self, token, db: AsyncSession):
        decoded_token = await self.decode_access_token(token=token)
        user_id = str(decoded_token['sub'])
        persisted_user: User = (await db.execute(select(User).where(User.id == user_id))).scalars().first()
        del persisted_user.hashed_password
        if not persisted_user:
            raise InvalidTokenException
        return persisted_user

    async def get_user_from_refresh_token(self, token, db: AsyncSession) -> User:
        decoded_token = await self.decode_refresh_token(token=token)
        user: User = parse_obj_as(User, await db.get(User, decoded_token['sub']))
        # user: User = (await db.execute(select(User).where(User.id == decoded_token['sub']))).scalars().first()
        # user = await self.user_repository.get_user_by_id(decoded_token['sub'])
        if not user:
            raise InvalidTokenException

        return user

    async def decode_access_token(self, token) -> dict:
        try:
            return jwt.decode(
                token,
                key=self.settings.JWT_ACCESS_SECRET_KEY,
                algorithms=[self.settings.JWT_ALGORITHM],
            )
        except jwt.exceptions.DecodeError:
            raise DecodeTokenException
        except jwt.exceptions.ExpiredSignatureError:
            raise ExpiredTokenException

    async def decode_refresh_token(self, token) -> dict:
        try:
            return jwt.decode(
                token,
                key=self.settings.JWT_REFRESH_SECRET_KEY,
                algorithms=[self.settings.JWT_ALGORITHM],
            )
        except jwt.exceptions.DecodeError:
            raise DecodeTokenException
        except jwt.exceptions.ExpiredSignatureError:
            raise ExpiredTokenException
