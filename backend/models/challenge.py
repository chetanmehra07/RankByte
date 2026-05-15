from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
 
class Challenge(Base):
    __tablename__ = "challenges"
 
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)       
    language = Column(String, nullable=True)
    difficulty = Column(String, nullable=False)  
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    ai_generated_content = Column(JSON, nullable=False)
    points_reward = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
 
    submissions = relationship("Submission", back_populates="challenge")