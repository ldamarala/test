import json
from loguru import logger
import os
import random
import time
import urllib
from datetime import datetime, timezone
from typing import Annotated, List
from uuid import uuid4

import openai
from fastapi.responses import FileResponse

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from pydantic import parse_obj_as
from sqlalchemy import select, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
import requests

from app.api.auth.auth_backend import requires_scope
from app.api.v1.schemas.ai_interview import AiInterviewSchema, AiInterviewCreateSchema, AiInterviewWizardSchema
from app.api.v1.schemas.ai_interview_question import AiInterviewQuestionSchema, AiInterviewQuestionWizardSchema
from app.api.v1.schemas.job_application import JobApplicationSchemaUpdate, JobApplicationWizardSchema, \
    JobApplicationSchema
from app.core.config import oauth2_scheme, celery_app
from app.core.database import get_db
from app.core.email import send_email, interview_invite_template
from app.models.ai_interview import AiInterview
from app.models.ai_interview_question import AiInterviewQuestion
from app.models.job import Job
from app.models.job_application import JobApplication
from app.models.user import User

router = APIRouter(
    tags=["ai-interview"],
    responses={404: {"description": "Not found"}},
)


# @router.get("/")
@router.get("/all", response_model=List[AiInterviewSchema])
@requires_scope(["admin", "recruiter", "hiring_manager", "candidate"])
async def get_ai_interviews(
        token: Annotated[str, Depends(oauth2_scheme)],
        request: Request,
        db: AsyncSession = Depends(get_db)):
    ai_interviews = (await db.execute(select(AiInterview))).scalars().all()
    ai_interviews_result = []
    for aii in ai_interviews:
        ai_interviews_result.append(AiInterviewSchema.model_validate(aii.__dict__))
    return ai_interviews_result


@router.get("/{ai_interview_id}", response_model=AiInterviewSchema)
@requires_scope(["admin", "recruiter", "hiring_manager", "candidate"])
async def get_ai_interview(ai_interview_id: str,
                           token: Annotated[str, Depends(oauth2_scheme)],
                           request: Request,
                           db: AsyncSession = Depends(get_db)):
    ai_interview = await db.get(AiInterview, ai_interview_id)
    if ai_interview is None:
        raise HTTPException(status_code=404, detail="Job application Not found")

    return AiInterviewSchema.model_validate(ai_interview.__dict__)


@router.get("/job-application-id/{job_application_id}", response_model=AiInterviewSchema)
@requires_scope(["admin", "recruiter", "hiring_manager", "candidate"])
async def get_ai_interview_for_job_application(job_application_id: str,
                                               token: Annotated[str, Depends(oauth2_scheme)],
                                               request: Request,
                                               db: AsyncSession = Depends(get_db)):
    # job_application_persisted = await db.get(JobApplication, job_application_id)
    ai_interview_persisted: AiInterview = (await db.execute(
        select(AiInterview).where(AiInterview.job_application_id == job_application_id))).scalars().first()

    if ai_interview_persisted is None:
        raise HTTPException(status_code=404, detail="AI Interview Not found")

    ai_interview_questions = (await db.execute(
        select(AiInterviewQuestion).where(
            AiInterviewQuestion.ai_interview_id == ai_interview_persisted.id))).scalars().all()

    ai_interview_questions_result = []
    for ai_interview_question in ai_interview_questions:
        ai_interview_questions_result.append(
            AiInterviewQuestionSchema.model_validate(ai_interview_question.__dict__))

    job_application_persisted = await db.get(JobApplication, ai_interview_persisted.job_application_id)
    if job_application_persisted is None:
        raise HTTPException(status_code=404, detail="Job application Not found")
    job_application = JobApplicationSchema.model_validate(job_application_persisted.__dict__)
    logger.info(job_application)

    ai_interview = AiInterviewSchema(questions=ai_interview_questions_result,
                                     application=job_application,
                                     **ai_interview_persisted.__dict__)
    return ai_interview


@router.get("/{ai_interview_id}/wizard", response_model=AiInterviewWizardSchema)
@requires_scope(["admin", "recruiter", "hiring_manager", "candidate"])
async def get_ai_interview_wizard(ai_interview_id: str,
                                  token: Annotated[str, Depends(oauth2_scheme)],
                                  request: Request,
                                  db: AsyncSession = Depends(get_db)):
    ai_interview_persisted = await db.get(AiInterview, ai_interview_id)
    if ai_interview_persisted is None:
        raise HTTPException(status_code=404, detail="AI Interview Not found")

    ai_interview_questions = (await db.execute(select(AiInterviewQuestion)
                                               .where(AiInterviewQuestion.ai_interview_id == ai_interview_id)
                                               .order_by(asc(AiInterviewQuestion.weight)))).scalars().all()
    ai_interview_questions_result = []
    for ai_interview_question in ai_interview_questions:
        ai_interview_questions_result.append(
            AiInterviewQuestionWizardSchema.model_validate(ai_interview_question.__dict__))
    # ai_interview.questions = ai_interview_questions_result

    job_application_persisted = await db.get(JobApplication, ai_interview_persisted.job_application_id)
    if job_application_persisted is None:
        raise HTTPException(status_code=404, detail="Job application Not found")
    job_application = JobApplicationWizardSchema.model_validate(job_application_persisted.__dict__)
    logger.info(job_application)

    ai_interview = AiInterviewWizardSchema(questions=ai_interview_questions_result,
                                           application=job_application,
                                           **ai_interview_persisted.__dict__)
    return ai_interview


@router.post("/skip", response_model=AiInterviewSchema)
@requires_scope(["admin", "recruiter"])
async def skip_ai_interview(ai_interview: AiInterviewCreateSchema,
                            token: Annotated[str, Depends(oauth2_scheme)],
                            request: Request,
                            db: AsyncSession = Depends(get_db)):
    job_id = uuid4().hex
    job_application: JobApplication = await JobApplication.get(db, ai_interview.job_application_id)
    if job_application is None:
        raise HTTPException(status_code=404, detail="Job Not found")

    await JobApplication.update(db=db,
                                job_application=JobApplicationSchemaUpdate(status="PROCESSING"),
                                job_application_id=job_application.id)

    return status.HTTP_200_OK


@router.post("/{ai_interview_id}/send-link", response_model=AiInterviewSchema)
@requires_scope(["admin", "recruiter", "hiring_manager", "candidate"])
async def get_ai_interview_wizard(ai_interview_id: str,
                                  token: Annotated[str, Depends(oauth2_scheme)],
                                  request: Request,
                                  db: AsyncSession = Depends(get_db)):
    ai_interview_persisted = await db.get(AiInterview, ai_interview_id)
    if ai_interview_persisted is None:
        raise HTTPException(status_code=404, detail="AI Interview Not found")

    ai_interview_questions = (await db.execute(select(AiInterviewQuestion)
                                               .where(AiInterviewQuestion.ai_interview_id == ai_interview_id)
                                               .order_by(asc(AiInterviewQuestion.weight)))).scalars().all()
    if ai_interview_questions is None:
        raise HTTPException(status_code=404, detail="AI Interview questions are not ready yet")
    ai_interview_questions_result = []
    for ai_interview_question in ai_interview_questions:
        ai_interview_questions_result.append(
            AiInterviewQuestionSchema.model_validate(ai_interview_question.__dict__))

    job_application_persisted = await db.get(JobApplication, ai_interview_persisted.job_application_id)
    if job_application_persisted is None:
        raise HTTPException(status_code=404, detail="Job application Not found")

    candidate_persisted = await db.get(User, job_application_persisted.candidate_id)
    job_persisted = await db.get(Job, job_application_persisted.job_id)

    if candidate_persisted is None:
        raise HTTPException(status_code=404, detail="Candidate details Not found")

    send_email(subject=f"Invitation for AI-Interview: {candidate_persisted.username}",
               message=interview_invite_template.format(candidate_name=candidate_persisted.firstname,
                                                        position=job_persisted.title,
                                                        interview_link=f"https://20.106.172.237/ai-interview/{ai_interview_id}",
                                                        company_name="NStarX"),
               sender_email='No-Reply@hire.ai',
               receiver_email=candidate_persisted.email,
               )

    ai_interview_persisted.status = "LINK_SENT"
    ai_interview_persisted.link_sent_time = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(ai_interview_persisted)

    ai_interview = AiInterviewSchema(questions=ai_interview_questions_result,
                                     application=job_application_persisted,
                                     **ai_interview_persisted.__dict__)
    return ai_interview


@router.post("/", )
@requires_scope(["admin", "recruiter"])
async def create_ai_interview(ai_interview: AiInterviewCreateSchema,
                              token: Annotated[str, Depends(oauth2_scheme)],
                              request: Request,
                              db: AsyncSession = Depends(get_db)):
    job_application = await db.get(JobApplication, ai_interview.job_application_id)
    if job_application is None:
        raise HTTPException(status_code=404, detail="Job Application Not found")

    ai_interview_id = uuid4().hex
    ai_interview_created = AiInterview(id=ai_interview_id, **ai_interview.dict())
    ai_interview_created.rating = 0
    ai_interview_created.feedback = "N/A"
    ai_interview_created.status = "INITIATED"
    db.add(ai_interview_created)

    job_application.status = "AI_INTERVIEW"

    await db.commit()
    await db.refresh(job_application)
    await db.refresh(ai_interview_created)

    ai_interview = AiInterviewSchema(**ai_interview_created.__dict__)
    ai_interview.questions = []
    ai_interview.application = JobApplicationSchema(**job_application.__dict__)

    task = celery_app.send_task(name="ai_interview.generate_question", args=[ai_interview_created.id])
    logger.info(task)

    return ai_interview


@router.post("/{ai_interview_id}/submit-all")
@requires_scope(["admin", "recruiter", "candidate"])
async def ai_interview_submit_all(ai_interview_id: str,
                                  token: Annotated[str, Depends(oauth2_scheme)],
                                  request: Request,
                                  db: AsyncSession = Depends(get_db)):
    ai_interview_persisted = await db.get(AiInterview, ai_interview_id)
    if not ai_interview_persisted:
        raise HTTPException(status_code=404, detail="AI Interview not set up")

    job_application = await db.get(JobApplication, ai_interview_persisted.job_application_id)
    if job_application is None:
        raise HTTPException(status_code=500,
                            detail="AI Interview configuration issue. Please contact administrator.")

    # ai_interview_persisted.status = "COMPLETED_PENDING_DECISION"
    # job_application.status = "AI_INTERVIEW_COMPLETED"

    task = celery_app.send_task(name="ai_interview.generate_feedback", args=[ai_interview_persisted.id])
    logger.info(task)

    await db.commit()
    await db.refresh(job_application)
    await db.refresh(ai_interview_persisted)
    return status.HTTP_200_OK
