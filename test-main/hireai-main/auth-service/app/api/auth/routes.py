from fastapi import APIRouter

from app.api.auth.schemas.responses import TokenResponse, ValidationErrorResponse
from app.api.auth.view import AuthView
from app.core.schemas.responses import UserNotFound

auth_views = AuthView()

auth_router = APIRouter(
    tags=["Auth"],
    responses={
        404: {"description": "Not found", "model": UserNotFound},
        422: {"description": "Validation Error", "model": ValidationErrorResponse},
    },

)


auth_router.add_api_route(
    "/token-form",
    auth_views.login_for_access_token,
    methods=["POST"],
    description="User Authentication and create access token using form",
    name="Authentication-AccessTokenForm",
    response_model_by_alias=False,
    response_model=TokenResponse,
)

auth_router.add_api_route(
    "/token",
    auth_views.access,
    methods=["POST"],
    description="User Authentication and create access token",
    name="Authentication-AccessToken",
    response_model_by_alias=False,
    response_model=TokenResponse,
)

auth_router.add_api_route(
    "/token/refresh",
    auth_views.refresh,
    methods=["POST"],
    description="Create access token from refresh token",
    name="Authentication-AccessToken-From-RefreshToken",
    response_model_by_alias=False,
    response_model=TokenResponse,
)
