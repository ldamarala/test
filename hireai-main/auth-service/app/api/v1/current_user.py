import json
from pprint import pprint
from loguru import logger
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.auth_backend import requires_scope
from app.core.config import oauth2_scheme
# from app.core.config import oauth2_scheme
from app.core.database import get_db
from app.api.auth.schemas.requests import SignupRequest
from ...models.user import User
from sqlalchemy import select
from uuid import uuid4
from app.api.auth.service import AuthService
from app.api.auth.schemas.requests import SignupRequest
from app.api.auth.schemas.exceptions import UserAlreadyExist
from  app.core.utils import hash_password

auth_service = AuthService()
router = APIRouter(
    tags=["auth-user"],
    responses={404: {"description": "Not found"}},
)


@router.get("/me", )
@requires_scope(["admin", "recruiter", "hiring_manager", "candidate",'user'])
async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        request: Request):
    return {**request.user.__dict__}



@router.post('/new_user')
async def create_new_user(
        details:SignupRequest,
        db: AsyncSession = Depends(get_db),
        ):
    print("entered")
    print(details)
    print(db)
    auth_service.signup
    # user: User = db.execute(select(User).where(User.email == details.email or User.firstname == details.firstname)))
    # print("userdetails",user)         
    # if user:
    #     raise UserAlreadyExist
    # else:
    hashpassword =str(hash_password(details.password),'utf-8')
   
    user = User(id=str(uuid4()), firstname=details.firstname, lastname=details.lastname,
                username=f"{details.firstname} {details.lastname}", 
                email=details.email, role='admin',
                disabled=False, 
                hashed_password=hashpassword)
    
    db.add(user)
    await db.commit()
    print(user)
    return user
    