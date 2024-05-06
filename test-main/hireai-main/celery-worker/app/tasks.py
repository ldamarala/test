import asyncio

from loguru import logger
from app.core.config import celery_app
from app.services.hireai_async_tasks import parse_resume, generate_question, generate_feedback


@celery_app.task(name="job_application.parse_resume", bind=True)
def job_application_parse_resume(self, job_application_id: str):
    persisted_job_application = asyncio.run(parse_resume(job_application_id))
    logger.info(persisted_job_application.__dict__)
    return True


@celery_app.task(name="ai_interview.generate_question", bind=True)
def ai_interview_generate_question(self, ai_interview_id: str):
    persisted_ai_interview = asyncio.run(generate_question(ai_interview_id))
    logger.info(persisted_ai_interview.__dict__)
    return True


@celery_app.task(name="ai_interview.generate_feedback", bind=True)
def ai_interview_generate_feedback(self, ai_interview_id: str):
    persisted_ai_interview = asyncio.run(generate_feedback(ai_interview_id))
    logger.info(persisted_ai_interview.__dict__)
    return True
