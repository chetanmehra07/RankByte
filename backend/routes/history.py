from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models.user import User
from models.submission import Submission
from models.challenge import Challenge
from services.points_service import get_language_mastery_all

router = APIRouter(prefix="/history", tags=["history"])

@router.get("/{clerk_id}")
async def get_submission_history(clerk_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    submissions = db.query(Submission).filter(Submission.user_id == user.id)\
        .order_by(desc(Submission.submitted_at)).limit(50).all()

    result = []
    for sub in submissions:
        challenge = db.query(Challenge).filter(Challenge.id == sub.challenge_id).first()
        result.append({
            "submission_id": sub.id,
            "challenge_id": sub.challenge_id,
            "challenge_title": challenge.title if challenge else "Unknown",
            "challenge_type": challenge.type if challenge else "Unknown",
            "language": challenge.language if challenge else "Unknown",
            "difficulty": challenge.difficulty if challenge else "Unknown",
            "score": sub.score,
            "is_correct": sub.is_correct,
            "time_taken_seconds": sub.time_taken_seconds,
            "ai_feedback": sub.ai_feedback,
            "submitted_at": sub.submitted_at,
            "points_reward": challenge.points_reward if challenge else 0
        })
    return result


@router.get("/language-mastery/{clerk_id}")
async def get_language_mastery(clerk_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    mastery = get_language_mastery_all(db, user.id)
    return [
        {
            "language": m.language,
            "points": m.points,
            "challenges_solved": m.challenges_solved,
            "level": m.level
        }
        for m in mastery
    ]