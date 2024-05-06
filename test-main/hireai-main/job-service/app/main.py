from fastapi.security import HTTPBearer, APIKeyHeader

from app.core.bootstrap.app import create_app
from fastapi import Request, Depends, Security

app = create_app()
