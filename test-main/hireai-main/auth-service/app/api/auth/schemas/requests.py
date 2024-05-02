from pydantic import BaseModel, EmailStr, validator, Field


class LoginRequest(BaseModel):
    username: str
    password: str = Field(..., min_length=1, max_length=32)

class SignupRequest(BaseModel):
    firstname:str
    lastname:str
    username:str
    email:str
    password:str = Field(...,min_length=1,max_length=32)

class RefreshTokenRequest(BaseModel):
    refresh_token: str
