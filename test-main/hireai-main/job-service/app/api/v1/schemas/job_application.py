from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.api.v1.schemas.job import JobSchema
from app.api.v1.schemas.user import UserSchema
from app.models.user import User


class JobApplicationSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    job_id: str
    candidate_id: str
    resume_location: str
    ai_interview_optin: bool
    status: str


class JobApplicationSchemaCreate(JobApplicationSchemaBase):
    resume_rating: float | None = None
    resume_feedback: str | None = None


class JobApplicationSchemaUpdate(BaseModel):
    ai_interview_optin: bool | None = None
    status: str


class JobApplicationSchema(JobApplicationSchemaBase):
    id: str


class JobApplicationAdminSchema(JobApplicationSchemaBase):
    id: str
    resume_rating: float | None = None
    resume_feedback: str | None = None
    candidate: UserSchema
    job: JobSchema
    Applied_on: datetime | None = None


class JobApplicationCandidateSchema(JobApplicationSchemaBase):
    id: str
    job: JobSchema
    interview_link: str | None = None
    time_created : datetime | None = None