from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from database import Base
 
class DailyChallenge(Base):
    __tablename__ = "daily_challenges"
 
    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    date = Column(Date, default=date.today)
    bonus_points = Column(Integer, default=20)
    created_at = Column(DateTime, default=datetime.utcnow)
 
 
class DailyChallengeCompletion(Base):
    __tablename__ = "daily_challenge_completions"
 
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    daily_challenge_id = Column(Integer, ForeignKey("daily_challenges.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    points_earned = Column(Integer, default=0)