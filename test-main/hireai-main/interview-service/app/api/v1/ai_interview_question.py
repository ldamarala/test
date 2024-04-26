from typing import Annotated

from fastapi import APIRouter, Depends, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas.ai_interview_question import AiInterviewQuestionUpdateSchema, AiInterviewQuestionSchema
from app.core.config import oauth2_scheme
from app.core.database import get_db
from app.models.ai_interview_question import AiInterviewQuestion

router = APIRouter(
    tags=["ai-interview-questions"],
    responses={404: {"description": "Not found"}},
)


@router.post("/{ai_interview_question_id}/interview/{ai_interview_id}/submit-answer")
async def answer_ai_interview_question(ai_interview_question_id: str,
                                       ai_interview_id: str,
                                       ai_interview_question: AiInterviewQuestionUpdateSchema,
                                       token: Annotated[str, Depends(oauth2_scheme)],
                                       request: Request,
                                       db: AsyncSession = Depends(get_db)):

    ai_interview_question_persisted = await db.get(AiInterviewQuestion, ai_interview_question_id)
    for field, value in ai_interview_question:
        setattr(ai_interview_question_persisted, field, value)
    await db.commit()
    await db.refresh(ai_interview_question_persisted)
    return status.HTTP_200_OK


@router.get("/interview/{ai_interview_id}")
async def ai_interview_question_by_interview_id(ai_interview_id: str,
                                       token: Annotated[str, Depends(oauth2_scheme)],
                                       request: Request,
                                       db: AsyncSession = Depends(get_db)):
    ai_interview_questions = ((await db.execute(select(AiInterviewQuestion)
                                               .where(AiInterviewQuestion.ai_interview_id == ai_interview_id)))
                              .scalars().all())
    ai_interview_questions_result = []
    for ai_interview_question in ai_interview_questions:
        ai_interview_questions_result.append(AiInterviewQuestionSchema.model_validate(ai_interview_question.__dict__))
    return ai_interview_questions_result

