import time
from typing import List, Annotated
from typing import List
from uuid import uuid4

import aiofiles
from loguru import logger
from fastapi import APIRouter, Depends, UploadFile, Form, HTTPException, Request
from pydantic import parse_obj_as
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.auth_backend import requires_scope
from app.api.v1.schemas.job import JobSchema
from app.api.v1.schemas.job_application import JobApplicationSchema, JobApplicationAdminSchema, \
    JobApplicationCandidateSchema
from app.api.v1.schemas.user import UserSchema
from app.core.config import oauth2_scheme, celery_app, job_application_status_candidate_map, job_application_status_map, \
    settings
from app.core.database import get_db
from app.models.ai_interview import AiInterview
from app.models.job import Job
from app.models.job_application import JobApplication
from app.models.user import User

router = APIRouter(
    tags=["Job Applications"],
    responses={404: {"description": "Not found"}},
)


@router.get("/all")
@requires_scope(["admin", "recruiter", "hiring_manager"])
async def get_job_applications(
        token: Annotated[str, Depends(oauth2_scheme)],
        request: Request,
        db: AsyncSession = Depends(get_db)):
    job_applications = ((await db.execute(select(JobApplication)))
                        .scalars().all())

    job_applications_result = []
    for ja in job_applications:
        candidate = await db.get(User, ja.candidate_id)
        job = await db.get(Job, ja.job_id)
        job_application = JobApplicationAdminSchema(job=JobSchema.model_validate(job.__dict__),
                                                    candidate=UserSchema.model_validate(
                                                        candidate.__dict__),
                                                    **ja.__dict__)
        job_application.status = job_application_status_map.get(ja.status, 'Processing')
        job_applications_result.append(job_application)

    return job_applications_result


@router.get("/{job_application_id}", response_model=JobApplicationSchema)
@requires_scope(["admin", "recruiter", "hiring_manager"])
async def get_job_application(job_application_id: str,
                              token: Annotated[str, Depends(oauth2_scheme)],
                              request: Request,
                              db: AsyncSession = Depends(get_db)):
    logger.info(f"get_job_application job_application_id: {job_application_id}")
    job_application = await db.get(JobApplication, job_application_id)
    if job_application is None:
        raise HTTPException(status_code=404, detail="Job application Not found")
    return JobApplicationSchema.model_validate(job_application.__dict__)


@router.get("/job-id/{job_id}")
@requires_scope(["admin", "recruiter", "hiring_manager"])
async def get_job_applications_by_job_id(job_id: str,
                                         token: Annotated[str, Depends(oauth2_scheme)],
                                         request: Request,
                                         db: AsyncSession = Depends(get_db)):
    persisted_job_applications = (
        await db.execute(select(JobApplication).where(JobApplication.job_id == job_id))).scalars().all()
    if persisted_job_applications is None:
        raise HTTPException(status_code=404, detail="Unable to find Job application")

    job_applications_result = []
    for ja in persisted_job_applications:
        candidate = await db.get(User, ja.candidate_id)
        job = await db.get(Job, ja.job_id)
        job_application = JobApplicationAdminSchema(job=JobSchema.model_validate(job.__dict__),
                                                    candidate=UserSchema.model_validate(
                                                        candidate.__dict__),
                                                    **ja.__dict__)
        job_application.status = job_application_status_map.get(job_application.status, 'Processing')
        job_applications_result.append(job_application)

    return job_applications_result


@router.get("/job-id/{job_id}/candidate-id/{candidate_id}", response_model=JobApplicationSchema)
@requires_scope(["admin", "recruiter", "hiring_manager", "candidate"])
async def get_job_application_by_job_id_candidate_id(job_id: str, candidate_id: str,
                                                     token: Annotated[str, Depends(oauth2_scheme)],
                                                     request: Request,
                                                     db: AsyncSession = Depends(get_db)):
    persisted_job_application = ((
                                     await db.execute(select(JobApplication)
                                     .where(
                                         JobApplication.job_id == job_id,
                                         JobApplication.candidate_id == candidate_id)))
                                 .scalars().first())
    if persisted_job_application is None:
        raise HTTPException(status_code=404, detail="Unable to find Job application")
    return JobApplicationSchema.model_validate(persisted_job_application.__dict__)


@router.get("/candidate-id/{candidate_id}", response_model=List[JobApplicationCandidateSchema])
@requires_scope(["admin", "recruiter", "hiring_manager", "candidate"])
async def get_job_application_by_candidate_id(candidate_id: str,
                                              token: Annotated[str, Depends(oauth2_scheme)],
                                              request: Request,
                                              db: AsyncSession = Depends(get_db)):
    persisted_job_applications = []
    if request.user.id == candidate_id or request.user.role == "admin":
        persisted_job_applications = ((
                                          await db.execute(select(JobApplication)
                                          .where(
                                              JobApplication.candidate_id == candidate_id)))
                                      .scalars().all())

    if persisted_job_applications is None:
        raise HTTPException(status_code=404, detail="Unable to find Job application")

    job_applications_result = []
    for ja in persisted_job_applications:
        job = await db.get(Job, ja.job_id)

        ai_interview_persisted: AiInterview = (await db.execute(
            select(AiInterview).where(AiInterview.job_application_id == ja.id))).scalars().first()
        if ai_interview_persisted and ai_interview_persisted.status == 'LINK_SENT':
            ja.interview_link = f"{settings.AI_INTERVIEW_HOST}/{ai_interview_persisted.id}"

        job_application = JobApplicationCandidateSchema(job=JobSchema.model_validate(job.__dict__),
                                                        **ja.__dict__)
        job_application.status = job_application_status_candidate_map.get(job_application.status, 'Processing')
        job_applications_result.append(job_application)
    return job_applications_result


@router.post("/job-id/{job_id}")
@requires_scope(["admin", "recruiter", "hiring_manager", "candidate"])
async def apply_for_job(job_id: str,
                        file: UploadFile,
                        token: Annotated[str, Depends(oauth2_scheme)],
                        request: Request,
                        db: AsyncSession = Depends(get_db),
                        ai_interview_optin: bool = Form(...)
                        ):
    current_user = request.user

    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job Not found")

    extension = "" if file.filename.endswith(".pdf") else ".pdf"
    file_location = f"uploads/resumes/{int(round(time.time()))}_{current_user.id}_{file.filename}{extension}"

    async with aiofiles.open(f"/src/app/{file_location}", "wb+") as file_object:
        await file_object.write(file.file.read())

    job_application_id = uuid4().hex
    new_job_application = JobApplication(id=job_application_id, job_id=job.id,
                                         candidate_id=current_user.id,
                                         resume_location=file_location,
                                         ai_interview_optin=ai_interview_optin,
                                         status="APPLIED")

    db.add(new_job_application)
    await db.commit()
    await db.refresh(new_job_application)

    task = celery_app.send_task(name="job_application.parse_resume", args=[new_job_application.id])
    logger.info(task)
    return JobApplicationSchema.model_validate(new_job_application.__dict__)
