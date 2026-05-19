from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db

from models.user import User
from models.challenge import Challenge
from models.daily_challenge import (
    DailyChallenge,
    DailyChallengeCompletion,
)

from services.ai_service import (
    generate_bug_fix_challenge,
    generate_system_design_challenge,
)

from services.points_service import (
    add_points,
    update_streak,
    get_user_difficulty,
)

from services.clerk_auth import verify_clerk_token

from pydantic import BaseModel
from datetime import date
import random

router = APIRouter(
    prefix="/daily",
    tags=["daily"]
)

DAILY_BONUS = 50


# ======================================================
# Request Model
# ======================================================

class DailyCompleteRequest(BaseModel):
    challenge_id: int
    daily_challenge_id: int
    answer: str


# ======================================================
# Create Daily Challenge Helper
# ======================================================

def create_daily_challenge(
    db: Session,
    challenge_type: str,
    difficulty_info,
    today,
    user
):

    languages = [
        "Python",
        "JavaScript",
        "Java",
        "C++",
    ]

    selected_language = random.choice(
        languages
    )

    # ======================================================
    # Generate AI Content
    # ======================================================

    if challenge_type == "BUG_FIX":

        ai_content = generate_bug_fix_challenge(
            selected_language,
            difficulty_info["level"],
            user.total_points
        )

    else:

        ai_content = generate_system_design_challenge(
            difficulty_info["level"],
            user.total_points
        )

    # ======================================================
    # Create Challenge
    # ======================================================

    challenge = Challenge(
        type=challenge_type,
        language=selected_language,
        difficulty=difficulty_info["difficulty"],
        title=f"[DAILY] {ai_content.get('title', 'Daily Challenge')}",
        description=ai_content.get(
            "description",
            ai_content.get("scenario", "")
        ),
        ai_generated_content=ai_content,
        points_reward=DAILY_BONUS
    )

    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    # ======================================================
    # Create Daily Challenge Entry
    # ======================================================

    daily = DailyChallenge(
        challenge_id=challenge.id,
        date=today,
        bonus_points=DAILY_BONUS
    )

    db.add(daily)
    db.commit()
    db.refresh(daily)

    return daily, challenge


# ======================================================
# Get Daily Challenges
# ======================================================

@router.get("/today")
async def get_daily_challenges(
    token_payload=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):

    clerk_id = token_payload["sub"]

    # ======================================================
    # Find User
    # ======================================================

    user = (
        db.query(User)
        .filter(User.clerk_id == clerk_id)
        .first()
    )

    # ======================================================
    # Auto Create User
    # ======================================================

    if not user:

        user = User(
            clerk_id=clerk_id,
            username="New User",
            email=f"{clerk_id}@temp.com"
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    today = date.today()

    difficulty_info = get_user_difficulty(
        user.total_points
    )

    # ======================================================
    # Get Existing Daily Challenges
    # ======================================================

    existing_daily = (
        db.query(DailyChallenge)
        .filter(DailyChallenge.date == today)
        .all()
    )

    existing_types = []

    challenges_response = []

    # ======================================================
    # Load Existing Challenges
    # ======================================================

    for daily in existing_daily:

        challenge = (
            db.query(Challenge)
            .filter(
                Challenge.id == daily.challenge_id
            )
            .first()
        )

        if challenge:

            existing_types.append(
                challenge.type
            )

            completed = (
                db.query(
                    DailyChallengeCompletion
                )
                .filter(
                    DailyChallengeCompletion.user_id
                    == user.id,

                    DailyChallengeCompletion.daily_challenge_id
                    == daily.id
                )
                .first()
            )

            already_completed = (
                completed is not None
            )

            challenges_response.append({
                "daily_challenge_id": daily.id,
                "challenge_id": challenge.id,
                "challenge_type": challenge.type,
                "title": challenge.title,
                "description": challenge.description,
                "content": challenge.ai_generated_content,
                "bonus_points": daily.bonus_points,
                "date": str(today),
                "already_completed": already_completed,
                "completed_at": (
                    completed.completed_at
                    if completed
                    else None
                )
            })

    # ======================================================
    # Generate Bug Fix Challenge
    # ======================================================

    if "BUG_FIX" not in existing_types:

        daily, challenge = (
            create_daily_challenge(
                db,
                "BUG_FIX",
                difficulty_info,
                today,
                user
            )
        )

        challenges_response.append({
            "daily_challenge_id": daily.id,
            "challenge_id": challenge.id,
            "challenge_type": challenge.type,
            "title": challenge.title,
            "description": challenge.description,
            "content": challenge.ai_generated_content,
            "bonus_points": daily.bonus_points,
            "date": str(today),
            "already_completed": False,
            "completed_at": None
        })

    # ======================================================
    # Generate System Design Challenge
    # ======================================================

    if "SYSTEM_DESIGN" not in existing_types:

        daily, challenge = (
            create_daily_challenge(
                db,
                "SYSTEM_DESIGN",
                difficulty_info,
                today,
                user
            )
        )

        challenges_response.append({
            "daily_challenge_id": daily.id,
            "challenge_id": challenge.id,
            "challenge_type": challenge.type,
            "title": challenge.title,
            "description": challenge.description,
            "content": challenge.ai_generated_content,
            "bonus_points": daily.bonus_points,
            "date": str(today),
            "already_completed": False,
            "completed_at": None
        })

    # ======================================================
    # Sort Challenges
    # ======================================================

    challenges_response.sort(
        key=lambda x: (
            0
            if x["challenge_type"] == "BUG_FIX"
            else 1
        )
    )

    # ======================================================
    # Return Challenges
    # ======================================================

    return {
        "daily_challenges": challenges_response
    }


# ======================================================
# Complete Daily Challenge
# ======================================================

@router.post("/complete")
async def complete_daily(
    data: DailyCompleteRequest,
    token_payload=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):

    clerk_id = token_payload["sub"]

    # ======================================================
    # Find User
    # ======================================================

    user = (
        db.query(User)
        .filter(
            User.clerk_id == clerk_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # ======================================================
    # Find Daily Challenge
    # ======================================================

    daily = (
    db.query(DailyChallenge)
    .filter(
        DailyChallenge.id
        == data.daily_challenge_id
    )
    .first()
)

    if not daily:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found"
        )

    # ======================================================
    # Validate Answer
    # ======================================================

    if len(data.answer.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Solution is too short"
        )

    # ======================================================
    # Already Completed?
    # ======================================================

    already = (
        db.query(DailyChallengeCompletion)
        .filter(
            DailyChallengeCompletion.user_id
            == user.id,

            DailyChallengeCompletion.daily_challenge_id
            == daily.id
        )
        .first()
    )

    if already:
        raise HTTPException(
            status_code=400,
            detail="Already completed this challenge"
        )

    # ======================================================
    # Save Completion
    # ======================================================

    completion = DailyChallengeCompletion(
        user_id=user.id,
        daily_challenge_id=daily.id,
        points_earned=daily.bonus_points
    )

    db.add(completion)
    db.commit()

    # ======================================================
    # Award Points + Update Streak
    # ======================================================

    update_streak(db, user.id)

    level_result = add_points(
        db,
        user.id,
        daily.bonus_points,
        "Daily Challenge completed!"
    )

    return {
        "success": True,
        "message": "Daily challenge completed!",
        "points_earned": daily.bonus_points,
        "level_result": level_result
    }