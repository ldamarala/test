from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.api.v1.schemas.user import UserSchema


class JobSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str | None = None
    summary: str | None = None
    responsibilities: str | None = None
    qualifications: str | None = None
    requirements: str | None = None
    key_competencies: str | None = None
    job_locations: str | None = None
    hiring_manager_id: str | None = None
    recruiter_id: str | None = None
    inactive: bool | None = None



class JobSchemaCreate(JobSchemaBase):
    pass


class JobSchemaUpdate(JobSchemaBase):
    pass


class JobSchema(JobSchemaBase):
    id: str
    time_created: datetime | None = None
    time_updated: datetime | None = None


class AdminJobSchema(JobSchemaBase):
    id: str
    recruiter: UserSchema
    hiring_manager: UserSchema
    time_created: datetime | None = None
    time_updated: datetime | None = None


