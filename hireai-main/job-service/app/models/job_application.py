from sqlalchemy import Column, String, Boolean, DateTime, func, Float

from app.models.base import Base


class JobApplication(Base):
    __tablename__ = "job_application"

    id = Column(String, primary_key=True)
    job_id = Column(String)
    candidate_id = Column(String)
    resume_location = Column(String)
    resume_rating = Column(Float)
    resume_feedback = Column(String)
    ai_interview_optin = Column(Boolean)
    status = Column(String)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

