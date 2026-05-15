from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
 
class LanguageMastery(Base):
    __tablename__ = "language_mastery"
 
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    language = Column(String, nullable=False)
    points = Column(Integer, default=0)
    challenges_solved = Column(Integer, default=0)
    level = Column(String, default="Beginner")
    updated_at = Column(DateTime, default=datetime.utcnow)
 
    user = relationship("User", back_populates="language_mastery")