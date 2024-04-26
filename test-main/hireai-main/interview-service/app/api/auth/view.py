from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas.requests import LoginRequest, RefreshTokenRequest
from .schemas.responses import TokenData, TokenResponse
from .service import AuthService
from ...core.database import get_db
from ...core.utils import base_response_to_json_response


class AuthView:
    def __init__(self, auth_service: AuthService = AuthService()):
        self.auth_service = auth_service

        # user = await authenticate_user(username=form_data.username, password=form_data.password, db=db)
        # if not user:
        #     raise HTTPException(status_code=400, detail="Incorrect username or password")
        #
        # access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        # refresh_token_expires = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
        #
        # access_token = create_token(data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires)
        # # refresh_token = create_token(data={"sub": user.username, "role": user.role}, expires_delta=refresh_token_expires)
        # # refresh_tokens.append(refresh_token)
        # # return Token(access_token=access_token, refresh_token=refresh_token)
        # return Token(access_token=access_token, roles=[user.role])

    async def access(self, login_request: LoginRequest,
                     db: AsyncSession = Depends(get_db)):
        token_data: TokenData = await self.auth_service.access(login_request, db)
        return token_data

    async def login_for_access_token(self, form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                     db: AsyncSession = Depends(get_db)):
        token_data: TokenData = await self.auth_service.access(LoginRequest(username=form_data.username,
                                                                            password=form_data.password), db)
        return token_data

    async def refresh(self, refresh_token_request: RefreshTokenRequest,
                     db: AsyncSession = Depends(get_db)):
        token_data: TokenData = await self.auth_service.refresh(refresh_token_request, db)
        return token_data

