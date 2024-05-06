from pydantic import BaseModel
from sqlalchemy import Column, String, Boolean, DateTime, func, Text, inspect
from sqlalchemy.orm import DeclarativeMeta, declarative_base

from app.models.base import Base


class Job(Base):
    __tablename__ = "job"

    id = Column(String, primary_key=True)
    title = Column(String)
    summary = Column(Text)
    responsibilities = Column(Text)
    qualifications = Column(Text)
    requirements = Column(Text)
    key_competencies = Column(Text)
    job_locations = Column(Text)
    hiring_manager_id = Column(String)
    recruiter_id = Column(String)
    inactive = Column(Boolean)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

