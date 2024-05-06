from sqlalchemy import Column, Integer, String, DateTime, Float, func, Text

from app.models.base import Base


class AiInterview(Base):
    __tablename__ = "ai_interview"

    id = Column(String, primary_key=True)
    job_application_id = Column(String)
    rating = Column(Float)
    feedback = Column(String)
    status = Column(String)
    link_sent_time = Column(DateTime(timezone=True))
    complete_time = Column(DateTime(timezone=True))
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

