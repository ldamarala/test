import asyncio
from datetime import datetime, timezone
from uuid import uuid4

import aiohttp
import openai
from PyPDF2 import PdfReader
from loguru import logger
from pandas._libs.lib import is_float
from sqlalchemy import select

from app.core.config import settings
from app.core.database import sessionmanager
from app.models.ai_interview import AiInterview
from app.models.ai_interview_question import AiInterviewQuestion
from app.models.job import Job
from app.models.job_application import JobApplication
from app.models.user import User
from app.services.gpt import gpt_resume_parser, ai_interview_question_feedback, ai_interview_feedback, \
    build_interview_feedback_document, generate_interview_questions
from app.services.talking_avatar import generate_video_with_ai_avatar, greeting_templates

openai.api_key = settings.OPENAI_API_KEY


async def parse_resume(job_application_id: str):
    async with sessionmanager.session() as db:
        persisted_job_application: JobApplication = await db.get(JobApplication, job_application_id)
        if persisted_job_application is None:
            raise Exception("Job Application Not found")
        logger.info(persisted_job_application.__dict__)

        persisted_job: Job = await db.get(Job, persisted_job_application.job_id)
        if persisted_job is None:
            raise Exception("Job Not found")

        rating, reasoning = gpt_resume_parser(f"/src/app/{persisted_job_application.resume_location}",
                                              persisted_job.title)

        persisted_job_application.resume_rating = rating
        persisted_job_application.resume_feedback = reasoning
        persisted_job_application.status = 'RESUME_PARSED'

        await db.commit()
        await db.refresh(persisted_job_application)
        return persisted_job_application


async def generate_question(ai_interview_id: str):
    logger.info(f"generate_question[ai_interview_id] >> {ai_interview_id}")
    async with sessionmanager.session() as db:
        ai_interview: AiInterview = await db.get(AiInterview, ai_interview_id)
        if ai_interview is None:
            raise Exception("AI Interview Not found")

        job_application: JobApplication = await db.get(JobApplication, ai_interview.job_application_id)
        if job_application is None:
            raise Exception("Job application Not found")

        candidate: User = await db.get(User, job_application.candidate_id)
        job: Job = await db.get(Job, job_application.job_id)

        async with aiohttp.ClientSession() as session:
            semaphore_greetings = asyncio.Semaphore(10)  # Limit concurrency to 5 requests
            tasks = [generate_video_with_ai_avatar(session,
                                                   video_id=f"{k}_{ai_interview.id}",
                                                   avatar_script_text=v.format(
                                                       candidate_name=candidate.firstname,
                                                       position=job.title,
                                                       company_name="NStarX"),
                                                   prefix="ai_interview",
                                                   semaphore=semaphore_greetings) for (k, v) in
                     greeting_templates.items()]
            await asyncio.gather(*tasks)

        pdf_text = ''
        with open(f"/src/app/{job_application.resume_location}", 'rb') as pdf_file:
            pdf_reader = PdfReader(pdf_file)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                pdf_text += page.extract_text()

        interview_questions = generate_interview_questions(pdf_text)
        questions_created = []
        question_video_generation_tasks = []
        question_weight = 10
        async with aiohttp.ClientSession() as session:
            semaphore_questions = asyncio.Semaphore(10)  # Limit concurrency to 10 requests
            for interview_question in interview_questions:
                ai_interview_question = AiInterviewQuestion(
                    id=uuid4().hex,
                    ai_interview_id=ai_interview.id,
                    question=interview_question,
                    weight=question_weight
                )
                question_weight += 10

                db.add(ai_interview_question)
                await db.commit()
                await db.refresh(ai_interview_question)
                # await generate_video_for_question(ai_interview_question)

                question_video_generation_tasks.append(
                    generate_video_with_ai_avatar(session,
                                                  video_id=f"{ai_interview_question.id}",
                                                  avatar_script_text=ai_interview_question.question,
                                                  prefix="ai_interview_question",
                                                  semaphore=semaphore_questions))
            await asyncio.gather(*question_video_generation_tasks)

        ai_interview.status = "AI_INTERVIEW_READY"
        job_application.status = "PROCESSING"

        await db.commit()
        await db.refresh(job_application)
        await db.refresh(ai_interview)
        return ai_interview


async def generate_feedback(ai_interview_id: str):
    logger.info(f"generate_question[ai_interview_id] >> {ai_interview_id}")
    async with (sessionmanager.session() as db):
        ai_interview: AiInterview = await db.get(AiInterview, ai_interview_id)
        if ai_interview is None:
            raise Exception("AI Interview Not found")

        job_application: JobApplication = await db.get(JobApplication, ai_interview.job_application_id)
        if job_application is None:
            raise Exception("Job application Not found")

        ai_interview_questions = ((await db.execute(select(AiInterviewQuestion)
                                                    .where(AiInterviewQuestion.ai_interview_id == ai_interview_id)))
                                  .scalars().all())
        if ai_interview_questions is None:
            raise Exception("AI Interview questions are not ready yet")

        ai_interview_feedback_request = ""
        for ai_interview_question in ai_interview_questions:
            rating, feedback = ai_interview_question_feedback(ai_interview_question.question,
                                                              ai_interview_question.candidate_answer)
            logger.debug(str(rating), feedback)

            ai_interview_question.rating = float(rating) if is_float(rating) else 1.0
            ai_interview_question.feedback = feedback
            await db.commit()
            await db.refresh(ai_interview_question)

            ai_interview_feedback_request += f'Question: {ai_interview_question.question} Answer: {ai_interview_question.candidate_answer} Rating: {ai_interview_question.rating}  Reason: {ai_interview_question.feedback} '

        decision, rating, feedback = ai_interview_feedback(ai_interview_feedback_request)

        ai_interview.status = decision.upper()
        ai_interview.rating = float(rating)
        ai_interview.feedback = feedback
        ai_interview.complete_time = datetime.now(timezone.utc)

        job_application.status = "AI_INTERVIEW_COMPLETED"

        await db.commit()
        await db.refresh(job_application)
        await db.refresh(ai_interview)

        candidate: User = await db.get(User, job_application.candidate_id)
        job: Job = await db.get(Job, job_application.job_id)

        await build_interview_feedback_document(ai_interview, ai_interview_questions, job_application, candidate)

        return ai_interview
