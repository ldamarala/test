import functools
import inspect
import json
import logging
import typing
from typing import Sequence, Tuple, Union, Annotated
from urllib.parse import urlencode

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from starlette._utils import is_async_callable
from starlette.requests import HTTPConnection, Request
from fastapi.security.utils import get_authorization_scheme_param
from starlette.authentication import (
    AuthenticationBackend,
    AuthenticationError,
    UnauthenticatedUser, AuthCredentials,
)
from starlette.responses import RedirectResponse

from app.api.auth.schemas.errors import CustomUnauthorizedError, CustomDecodeTokenError, CustomExpiredTokenError, \
    CustomInvalidTokenError
from app.api.auth.schemas.exceptions import DecodeTokenException, ExpiredTokenException
from app.api.auth.service import AuthService
from app.api.shared.schemas.responses import SystemUser
from app.core.config import settings
from app.core.database import get_db, sessionmanager


_P = typing.ParamSpec("_P")


class AuthBackend(AuthenticationBackend):
    def __init__(
            self, prefix: str,
            exclude_paths: Sequence[str],
            auth_service: AuthService = AuthService()
    ):
        self.prefix = prefix
        self.exclude_paths = exclude_paths if exclude_paths else []
        self.auth_service = auth_service

    async def authenticate(
            self,
            conn: HTTPConnection
    ) -> Tuple[AuthCredentials, Union[SystemUser, UnauthenticatedUser]]:
        # current_path = conn.url.path.removeprefix(self.prefix)
        # for path in self.exclude_paths:
        #     print(path, current_path)
        #     if current_path.startswith(path):
        #         return AuthCredentials(scopes=[]), UnauthenticatedUser()

        path = conn.url.path.removeprefix(self.prefix)
        if any(pattern.match(path) for pattern in self.exclude_paths):
            return AuthCredentials(scopes=[]), UnauthenticatedUser()

        authorization: str = conn.headers.get("Authorization")
        if not authorization:
            raise CustomUnauthorizedError

        scheme, token = get_authorization_scheme_param(authorization)
        if not (authorization and scheme and token):
            raise CustomUnauthorizedError
        if scheme.lower() != "bearer":
            raise CustomUnauthorizedError

        try:
            async with sessionmanager.session() as session:
                user = await self.auth_service.get_user_from_access_token(token, db=session)
                scopes = user.role.split(",")
                conn.scope["user"] = user

        except DecodeTokenException:
            raise CustomDecodeTokenError
        except ExpiredTokenException:
            raise CustomExpiredTokenError
        except Exception as e:
            raise CustomInvalidTokenError

        return AuthCredentials(scopes=scopes), user


def has_required_scope(conn: HTTPConnection, scopes: typing.Sequence[str]) -> bool:
    if not scopes:
        return True
    return True if (not scopes or [i for i in conn.auth.scopes if i in scopes]) else False


def requires_scope(
        scopes: str | typing.Sequence[str],
        status_code: int = 403,
        redirect: str | None = None,
) -> typing.Callable[
    [typing.Callable[_P, typing.Any]], typing.Callable[_P, typing.Any]
]:
    scopes_list = [scopes] if isinstance(scopes, str) else list(scopes)

    def decorator(
            func: typing.Callable[_P, typing.Any],
    ) -> typing.Callable[_P, typing.Any]:
        sig = inspect.signature(func)
        for idx, parameter in enumerate(sig.parameters.values()):
            if parameter.name == "request" or parameter.name == "websocket":
                type_ = parameter.name
                break
        else:
            raise Exception(
                f'No "request" or "websocket" argument on function "{func}"'
            )

        if is_async_callable(func):
            # Handle async request/response functions.
            @functools.wraps(func)
            async def async_wrapper(*args: _P.args, **kwargs: _P.kwargs) -> typing.Any:
                request = kwargs.get("request", args[idx] if idx < len(args) else None)
                assert isinstance(request, Request)

                if not has_required_scope(request, scopes_list):
                    if redirect is not None:
                        orig_request_qparam = urlencode({"next": str(request.url)})
                        next_url = "{redirect_path}?{orig_request}".format(
                            redirect_path=request.url_for(redirect),
                            orig_request=orig_request_qparam,
                        )
                        return RedirectResponse(url=next_url, status_code=303)
                    raise HTTPException(status_code=status_code)
                return await func(*args, **kwargs)

            return async_wrapper

        else:
            # Handle sync request/response functions.
            @functools.wraps(func)
            def sync_wrapper(*args: _P.args, **kwargs: _P.kwargs) -> typing.Any:
                request = kwargs.get("request", args[idx] if idx < len(args) else None)
                assert isinstance(request, Request)

                if not has_required_scope(request, scopes_list):
                    if redirect is not None:
                        orig_request_qparam = urlencode({"next": str(request.url)})
                        next_url = "{redirect_path}?{orig_request}".format(
                            redirect_path=request.url_for(redirect),
                            orig_request=orig_request_qparam,
                        )
                        return RedirectResponse(url=next_url, status_code=303)
                    raise HTTPException(status_code=status_code)
                return func(*args, **kwargs)

            return sync_wrapper

    return decorator
