from fastapi import FastAPI

from app.api.v1.job import router as jobs_router_v1
from app.api.v1.job_application import router as job_applications_router_v1


def init_routers(app_: FastAPI) -> None:

    app_.include_router(jobs_router_v1, prefix="/v1/job")
    app_.include_router(job_applications_router_v1, prefix="/v1/application")
