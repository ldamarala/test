from datetime import datetime
from pydantic import BaseModel


class AiInterviewQuestionBaseSchema(BaseModel):
    pass


class AiInterviewQuestionCreateSchema(AiInterviewQuestionBaseSchema):
    ai_interview_id: str
    question: str
    weight: int


class AiInterviewQuestionUpdateSchema(AiInterviewQuestionBaseSchema):
    candidate_answer: str
    feedback: str = None
    rating: float = None
    start_time: datetime = None
    complete_time: datetime = None


class AiInterviewQuestionSchema(AiInterviewQuestionBaseSchema):
    id: str
    weight: int = None
    question: str
    candidate_answer:str | None = None
    feedback: str | None = None
    rating: float | None = None
    start_time: datetime | None = None
    complete_time: datetime | None = None


class AiInterviewQuestionWizardSchema(AiInterviewQuestionBaseSchema):
    id: str
    weight: int
    question: str
