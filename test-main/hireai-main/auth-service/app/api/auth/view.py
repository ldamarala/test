from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas.requests import LoginRequest, RefreshTokenRequest,SignupRequest
from .schemas.responses import TokenData
from .service import AuthService
# from ...core.config import oauth2_scheme
from ...core.database import get_db
from ...models.user import User
from sqlalchemy import select,insert

class AuthView:
    def __init__(self, auth_service: AuthService = AuthService()):
        self.auth_service = auth_service

    async def access(self, login_request: LoginRequest,
                     db: AsyncSession = Depends(get_db)):
        token_data: TokenData = await self.auth_service.access(login_request, db)
        return token_data
    
    async def signup(self,signup_request:SignupRequest, db: AsyncSession):
        user: User = (await db.execute( insert(User).values([{'firstname':signup_request.firstname,'lastname':signup_request.lastname,'email':signup_request.email,'password':hash_password(signup_request.password)}])))
        return await ('signed up succesful')


    async def login_for_access_token(self, form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                     db: AsyncSession = Depends(get_db)):
        token_data: TokenData = await self.auth_service.access(LoginRequest(username=form_data.username,
                                                                            password=form_data.password), db)
        return token_data

    async def refresh(self, refresh_token_request: RefreshTokenRequest,
                      db: AsyncSession = Depends(get_db)):
        token_data: TokenData = await self.auth_service.refresh(refresh_token_request, db)
        return token_data
