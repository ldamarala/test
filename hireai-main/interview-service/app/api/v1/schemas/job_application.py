from pydantic import BaseModel, ConfigDict


class JobApplicationSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    job_id: str
    candidate_id: str
    resume_location: str
    ai_interview_optin: bool
    status: str


class JobApplicationSchemaCreate(JobApplicationSchemaBase):
    resume_rating: float
    resume_feedback: str


class JobApplicationSchemaUpdate(BaseModel):
    ai_interview_optin: bool | None = None
    status: str


class JobApplicationSchema(JobApplicationSchemaBase):
    id: str


class JobApplicationWizardSchema(JobApplicationSchemaBase):
    id: str
