from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
 
class Submission(Base):
    __tablename__ = "submissions"
 
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    submitted_code = Column(Text, nullable=True)
    ai_feedback = Column(JSON, nullable=True)
    score = Column(Integer, default=0)
    is_correct = Column(Boolean, default=False)
    time_taken_seconds = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.utcnow)
 
    user = relationship("User", back_populates="submissions")
    challenge = relationship("Challenge", back_populates="submissions")