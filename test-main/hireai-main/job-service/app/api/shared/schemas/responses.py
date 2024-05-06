from http import HTTPStatus
from typing import List, Any

from pydantic import BaseModel, EmailStr

from app.core.enums.status_type import StatusType
from app.core.schemas.base import BaseResponse


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
