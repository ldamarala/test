from typing import Annotated

import jwt
from datetime import datetime, timedelta

from fastapi import Depends
from pydantic import parse_obj_as
from sqlalchemy import select,insert
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas.requests import LoginRequest, RefreshTokenRequest,SignupRequest
from .schemas.exceptions import (
    PasswordDoesNotMatchException,
    DecodeTokenException,
    ExpiredTokenException,
    InvalidTokenException, UserNotFoundException, UserAlreadyExist
)
from .schemas.responses import TokenData, TokenPayload
from ...core.config import get_settings
from ...core.database import get_db
from ...core.utils import verify_password
from ...models.user import User


class AuthService:
    def __init__(self):
        self.settings = get_settings()

    async def access(self, login_request: LoginRequest, db: AsyncSession):
        user: User = (await db.execute(select(User).where(User.username == login_request.username))).scalars().first()
        # user: User = (await db.execute(select(User).where(User.username == login_request.username))).scalars().first()
        if not user:
            raise UserNotFoundException

        if not verify_password(login_request.password, user.hashed_password):
            raise PasswordDoesNotMatchException

        return await self.create_token_data_from_user(user)
    
    async def signup(self,signup_request:SignupRequest, db: AsyncSession):
        
        return await ('signed up succesful')

    # async def signup(self,signup_request:SignupRequest,db:AssertionError):
    #       user: User = await(await db.execute(select(User).where(User.email == SignupRequest.email or User.firstname == SignupRequest.firstname)))
          
    #       if user:
    #           raise UserAlreadyExist
          
    #       return signup_request

    async def refresh(self, refresh_token_request: RefreshTokenRequest, db: AsyncSession) -> TokenData:
        user: User = await self.get_user_from_refresh_token(refresh_token_request.refresh_token, db)
        return await self.create_token_data_from_user(user)

    async def create_access_token(self, payload: TokenPayload):
        return jwt.encode(
            payload={
                **payload.dict(),
                "exp": datetime.utcnow() + timedelta(seconds=self.settings.ACCESS_TOKEN_EXPIRE_SECONDS),
            },
            key=self.settings.JWT_ACCESS_SECRET_KEY,
            algorithm=self.settings.JWT_ALGORITHM,
        )

    async def create_refresh_token(self, payload: TokenPayload):
        return jwt.encode(
            payload={
                **payload.dict(),
                "exp": datetime.utcnow() + timedelta(seconds=self.settings.REFRESH_TOKEN_EXPIRE_SECONDS),
            },
            key=self.settings.JWT_REFRESH_SECRET_KEY,
            algorithm=self.settings.JWT_ALGORITHM,
        )

    async def create_token_data_from_user(self, user: User) -> TokenData:
        payload = TokenPayload(
            sub=user.id,
            name=user.username
        )

        return TokenData(
            access_token=await self.create_access_token(payload=payload),
            refresh_token=await self.create_refresh_token(payload=payload),
            access_expires=datetime.timestamp(
                datetime.now() + timedelta(seconds=self.settings.ACCESS_TOKEN_EXPIRE_SECONDS)),
            refresh_expires=datetime.timestamp(
                datetime.now() + timedelta(seconds=self.settings.REFRESH_TOKEN_EXPIRE_SECONDS)),
        )

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
        user_id = str(decoded_token['sub'])
        # user: User = parse_obj_as(User, await db.get(User, decoded_token['sub']))
        user: User = (await db.execute(select(User).where(User.id == user_id))).scalars().first()
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
