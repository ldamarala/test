from pydantic import BaseModel


class UserSchemaBase(BaseModel):
    firstname: str | None = None
    lastname: str | None = None
    username: str | None = None
    email: str | None = None
    role: str | None = None


class UserSchemaCreate(UserSchemaBase):
    password: str | None = None


class UserSchema(UserSchemaBase):
    id: str

