from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.challenge import Challenge
from services.ai_service import get_single_hint, explain_optimal_solution
from services.points_service import deduct_points, get_user_difficulty
from pydantic import BaseModel

router = APIRouter(prefix="/hints", tags=["hints"])

class HintRequest(BaseModel):
    clerk_id: str
    challenge_id: int
    hints_used: int

class ExplainRequest(BaseModel):
    clerk_id: str
    challenge_id: int
    user_code: str

HINT_COST = 3

@router.post("/get")
async def get_hint(request: HintRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.clerk_id == request.clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.total_points < HINT_COST:
        raise HTTPException(status_code=400, detail="Not enough points for a hint")

    challenge = db.query(Challenge).filter(Challenge.id == request.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    difficulty_info = get_user_difficulty(user.total_points)

    hint_data = get_single_hint(
        challenge_description=challenge.description,
        language=challenge.language,
        hints_used=request.hints_used,
        user_level=difficulty_info["level"]
    )

    deduct_points(db, user.id, HINT_COST, f"Hint #{request.hints_used + 1} for: {challenge.title}")

    return {
        "hint": hint_data.get("hint", ""),
        "hint_number": hint_data.get("hint_number", request.hints_used + 1),
        "is_final_hint": hint_data.get("is_final_hint", False),
        "points_deducted": HINT_COST,
        "remaining_points": user.total_points - HINT_COST
    }


@router.post("/explain")
async def explain_solution(request: ExplainRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.clerk_id == request.clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    challenge = db.query(Challenge).filter(Challenge.id == request.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    difficulty_info = get_user_difficulty(user.total_points)
    content = challenge.ai_generated_content

    explanation = explain_optimal_solution(
        challenge_description=challenge.description,
        language=challenge.language,
        user_code=request.user_code,
        optimal_solution=content.get("optimal_solution", "Not available"),
        user_level=difficulty_info["level"]
    )

    return {"explanation": explanation, "challenge_title": challenge.title}