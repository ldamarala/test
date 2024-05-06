from app.core.enums.response_status import ResponseStatus
from app.core.enums.status_type import StatusType
from app.core.schemas.base import BaseResponse


class UserRegisteredSuccessfully(BaseResponse):
    status: str = StatusType.SUCCESS.value
    status_type: str = ResponseStatus.USER_REGISTERED.name
    message: str = ResponseStatus.USER_REGISTERED.message
    _status_code: int = ResponseStatus.USER_REGISTERED.status_code


class UserNotFound(BaseResponse):
    status: str = StatusType.ERROR.value
    status_type: str = ResponseStatus.USER_NOT_FOUND.name
    message: str = ResponseStatus.USER_NOT_FOUND.message
    _status_code: int = ResponseStatus.USER_NOT_FOUND.status_code


class DuplicateEmail(BaseResponse):
    status: str = StatusType.ERROR.value
    status_type: str = ResponseStatus.DUPLICATE_EMAIL.name
    message: str = ResponseStatus.DUPLICATE_EMAIL.message
    _status_code: str = ResponseStatus.DUPLICATE_EMAIL.status_code
