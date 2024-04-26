from sqlalchemy import Column, Integer, String, DateTime, Float, func, Text

from app.models.base import Base


class AiInterviewQuestion(Base):
    __tablename__ = "ai_interview_question"

    id = Column(String, primary_key=True)
    ai_interview_id = Column(String)
    weight = Column(Integer)
    question = Column(Text)
    candidate_answer = Column(Text)
    feedback = Column(Text)
    rating = Column(Float)
    start_time = Column(DateTime(timezone=True))
    complete_time = Column(DateTime(timezone=True))
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
