from fastapi import FastAPI

from app.api.v1.ai_interview import router as ai_interview_v1
from app.api.v1.ai_interview_question import router as ai_interview_question_v1


def init_routers(app_: FastAPI) -> None:
    app_.include_router(ai_interview_v1, prefix="/v1/ai-interview")
    app_.include_router(ai_interview_question_v1, prefix="/v1/ai-interview-question")
