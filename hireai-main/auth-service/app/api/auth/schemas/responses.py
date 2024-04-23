from http import HTTPStatus
from typing import Optional, List

from pydantic import BaseModel, EmailStr, validator

from app.core.enums.response_status import ResponseStatus
from app.core.enums.status_type import StatusType
from app.core.schemas.base import BaseResponse


class TokenData(BaseModel):
    access_token: str
    refresh_token: Optional[str]
    access_expires: float
    refresh_expires: Optional[float]
    token_type: str = "Bearer"


class TokenPayload(BaseModel):
    sub: str
    name: str


class TokenResponse(BaseResponse):
    access_token: str
    refresh_token: Optional[str]
    access_expires: float
    refresh_expires: Optional[float]
    token_type: str = "Bearer"
    status: int = StatusType.SUCCESS.value
    status_type: str = ResponseStatus.USER_LOGGED_IN.name
    message: str = ResponseStatus.USER_LOGGED_IN.message
    _status_code: str = ResponseStatus.USER_LOGGED_IN.status_code
    # data: TokenData



class ValidationErrorResponse(BaseResponse):
    status: str = StatusType.ERROR.value
    status_type: str = HTTPStatus.UNPROCESSABLE_ENTITY.name
    message: str = HTTPStatus.UNPROCESSABLE_ENTITY.phrase
    errors: List = {
        'field_name': ["validation error message"],
        'another_field_name': ["validation error message"]
    }

class SystemUser(BaseModel):
    name: str
    email: EmailStr
    phone: str
