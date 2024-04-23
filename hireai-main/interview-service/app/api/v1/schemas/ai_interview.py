from datetime import datetime
from typing import List

from pydantic import BaseModel

from app.api.v1.schemas.ai_interview_question import AiInterviewQuestionWizardSchema, AiInterviewQuestionSchema
from app.api.v1.schemas.job_application import JobApplicationWizardSchema, JobApplicationSchema


class AiInterviewBaseSchema(BaseModel):
    pass


class AiInterviewCreateSchema(AiInterviewBaseSchema):
    job_application_id: str


class AiInterviewUpdateSchema(AiInterviewBaseSchema):
    rating: float = None
    feedback: str = None
    status: str = None
    link_sent_time: datetime = None
    complete_time: datetime = None


class AiInterviewSchema(AiInterviewBaseSchema):
    id: str | None = None
    job_application_id: str | None = None
    rating: float | None = None
    feedback: str | None = None
    status: str | None = None

    questions: List[AiInterviewQuestionSchema] | None = None
    application: JobApplicationSchema | None = None

    link_sent_time: datetime | None = None
    complete_time: datetime | None = None

    class Config:
        orm_mode = True
        populate_by_name = True


class AiInterviewWizardSchema(AiInterviewBaseSchema):
    id: str | None = None
    job_application_id: str | None = None
    questions: List[AiInterviewQuestionWizardSchema] | None = None
    application: JobApplicationWizardSchema | None = None

    class Config:
        orm_mode = True
        populate_by_name = True
        exclude_unset = True
