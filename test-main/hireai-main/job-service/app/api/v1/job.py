import logging
from typing import Annotated, List
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi import Request, Depends
from pydantic import parse_obj_as
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.auth_backend import requires_scope
from app.api.v1.schemas.job import JobSchemaCreate, JobSchemaUpdate, JobSchema, AdminJobSchema
from app.api.v1.schemas.user import UserSchema
from app.core.config import oauth2_scheme
from app.core.database import get_db
from app.models.job import Job
from app.models.user import User

router = APIRouter(
    tags=["Jobs"],
    responses={404: {"description": "Not found"}},
)


@router.get("/admin/all", response_model=List[AdminJobSchema])
@requires_scope(["admin", "recruiter", "hiring_manager"])
async def admin_get_jobs(
        token: Annotated[str, Depends(oauth2_scheme)],
        request: Request,
        db: AsyncSession = Depends(get_db)
):
    print("User >> ", request.user.role, request.user.id)
    jobs = ((await db.execute(select(Job))).scalars().all())
    jobs_result = []
    for j in jobs:
        if (request.user.role == 'admin'
                or request.user.id == j.recruiter_id or request.user.id == j.hiring_manager_id):
            recruiter = await db.get(User, j.recruiter_id)
            hiring_manager = await db.get(User, j.hiring_manager_id)
            job = AdminJobSchema(recruiter=UserSchema.model_validate(recruiter.__dict__),
                                 hiring_manager=UserSchema.model_validate(hiring_manager.__dict__),
                                 **j.__dict__)
            jobs_result.append(job)
    return jobs_result


@router.get("/all", response_model=List[JobSchema])
# @requires_scope(["admin", "recruiter", "hiring_manager", "candidate"])
async def get_jobs(
        request: Request,
        db: AsyncSession = Depends(get_db)
):
    return parse_obj_as(List[JobSchema], (await db.execute(select(Job))).scalars().all())


@router.get("/{job_id}", response_model=JobSchema)
async def get_job(job_id: str,
                  request: Request,
                  db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job Not found")
    return JobSchema.model_validate(job.__dict__)
    # return parse_obj_as(JobSchema, await db.get(Job, job_id))


@router.post("/", response_model=JobSchema)
@requires_scope(["admin", "recruiter"])
async def create_job(job: JobSchemaCreate,
                     token: Annotated[str, Depends(oauth2_scheme)],
                     request: Request,
                     db: AsyncSession = Depends(get_db)):
    job_id = uuid4().hex
    print(job)
    new_job = Job(id=job_id, **job.dict())
    db.add(new_job)
    await db.commit()
    await db.refresh(new_job)
    return JobSchema.model_validate(new_job.__dict__)


@router.put("/{job_id}", response_model=JobSchema)
@requires_scope(["admin", "recruiter"])
async def update_job(job_id: str,
                     job: JobSchemaUpdate,
                     token: Annotated[str, Depends(oauth2_scheme)],
                     request: Request,
                     db: AsyncSession = Depends(get_db)):
    persisted_job = await Job.get(db, job_id)
    for field, value in job:
        setattr(persisted_job, field, value)
    await db.commit()
    await db.refresh(persisted_job)
    return JobSchema.model_validate(persisted_job.__dict__)
