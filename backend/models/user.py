from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    total_points = Column(Integer, default=0)
    level = Column(String, default="Beginner")
    streak_days = Column(Integer, default=0)
    last_active = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="user")
    point_transactions = relationship("PointTransaction", back_populates="user")
    language_mastery = relationship("LanguageMastery", back_populates="user")
    daily_question_count = Column(Integer, default=0)
    last_question_reset = Column(DateTime, nullable=True)