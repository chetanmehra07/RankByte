from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models.user import User
from models.challenge import Challenge

from services.ai_service import (
    generate_coding_task,
    generate_bug_fix_challenge,
    generate_system_design_challenge
)

from services.points_service import (
    get_user_difficulty,
    get_language_difficulty
)

from services.clerk_auth import verify_clerk_token

from pydantic import BaseModel
from typing import Optional

from services.question_limit_service import (
    check_daily_question_limit,
    increment_daily_question_count
)

router = APIRouter(
    prefix="/challenges",
    tags=["challenges"]
)


# ======================================================
# REQUEST MODEL
# ======================================================

class GenerateChallengeRequest(BaseModel):
    language: Optional[str] = None
    challenge_type: str  # CODING_TASK | BUG_FIX | SYSTEM_DESIGN


# ======================================================
# GENERATE CHALLENGE
# ======================================================

@router.post("/generate")
async def generate_challenge(
    request: GenerateChallengeRequest,
    token_payload=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):

    # ======================================================
    # REAL CLERK USER ID
    # ======================================================

    clerk_id = token_payload["sub"]

    # ======================================================
    # FIND USER
    # ======================================================

    user = db.query(User).filter(
        User.clerk_id == clerk_id
    ).first()

    # ======================================================
    # CREATE USER IF NOT EXISTS
    # ======================================================

    if not user:

        user = User(
            clerk_id=clerk_id,
            username=(
                token_payload.get("username")
                or token_payload.get("name")
                or "New User"
            ),
            email=(
                token_payload.get("email")
                or f"{clerk_id}@temp.com"
            )
        )

        db.add(user)

        db.commit()

        db.refresh(user)

    # ======================================================
    # DAILY AI LIMIT CHECK
    # ======================================================

    limit_info = check_daily_question_limit(
        db,
        user.id
    )

    if not limit_info["allowed"]:

        raise HTTPException(
            status_code=403,
            detail={
                "message":
                "You have reached your daily free AI challenge limit.",
                "limit_reached": True,
                "remaining": 0
            }
        )

    # ======================================================
    # USER DIFFICULTY
    # ======================================================

    if request.language:

        difficulty_info = get_language_difficulty(
            db,
            user.id,
            request.language
        )

    else:

        difficulty_info = get_user_difficulty(
            user.total_points
        )

    user_level = difficulty_info["level"]

    points_multiplier = difficulty_info[
        "points_multiplier"
    ]

    try:

        # ======================================================
        # CODING TASK
        # ======================================================

        if request.challenge_type == "CODING_TASK":

            ai_content = generate_coding_task(
                request.language,
                user_level,
                user.total_points
            )

            base_points = 10

            title = ai_content.get(
                "title",
                "Coding Challenge"
            )

            description = ai_content.get(
                "description",
                ""
            )

        # ======================================================
        # BUG FIX
        # ======================================================

        elif request.challenge_type == "BUG_FIX":

            ai_content = generate_bug_fix_challenge(
                request.language,
                user_level,
                user.total_points
            )

            base_points = 15

            title = ai_content.get(
                "title",
                "Bug Fix Challenge"
            )

            description = ai_content.get(
                "description",
                ""
            )

        # ======================================================
        # SYSTEM DESIGN
        # ======================================================

        elif request.challenge_type == "SYSTEM_DESIGN":

            ai_content = generate_system_design_challenge(
                user_level,
                user.total_points
            )

            base_points = 30

            title = ai_content.get(
                "title",
                "System Design Challenge"
            )

            description = ai_content.get(
                "scenario",
                ""
            )

        else:

            raise HTTPException(
                status_code=400,
                detail="Invalid challenge type"
            )

        # ======================================================
        # POINTS CALCULATION
        # ======================================================

        points_reward = int(
            base_points * points_multiplier
        )

        # ======================================================
        # SAVE CHALLENGE
        # ======================================================

        challenge = Challenge(
            type=request.challenge_type,
            language=request.language
            if request.language else None,
            difficulty=ai_content.get(
                "difficulty",
                difficulty_info["difficulty"]
            ),
            title=title,
            description=description,
            ai_generated_content=ai_content,
            points_reward=points_reward
        )

        db.add(challenge)

        db.commit()

        db.refresh(challenge)

        # ======================================================
        # INCREMENT DAILY QUESTION COUNT
        # ======================================================

        increment_daily_question_count(
            db,
            user.id
        )

        # ======================================================
        # REFRESH USER AFTER INCREMENT
        # ======================================================

        db.refresh(user)

        # ======================================================
        # SAFE CONTENT FOR FRONTEND
        # ======================================================

        safe_content = {}

        # ------------------------------------------------------
        # BUG FIX
        # ------------------------------------------------------

        if challenge.type == "BUG_FIX":

            safe_content = {
                "faulty_code_lines": ai_content.get(
                    "faulty_code_lines",
                    []
                ),

                "hints": ai_content.get(
                    "hints",
                    []
                )
            }

        # ------------------------------------------------------
        # CODING TASK
        # ------------------------------------------------------

        elif challenge.type == "CODING_TASK":

            safe_content = {
                "example_input": ai_content.get(
                    "example_input"
                ),

                "example_output": ai_content.get(
                    "example_output"
                ),

                "hints": ai_content.get(
                    "hints",
                    []
                )
            }

        # ------------------------------------------------------
        # SYSTEM DESIGN
        # ------------------------------------------------------

        elif challenge.type == "SYSTEM_DESIGN":

            safe_content = {
                "requirements": ai_content.get(
                    "requirements",
                    []
                ),

                "hints": ai_content.get(
                    "hints",
                    []
                )
            }

        # ======================================================
        # RESPONSE
        # ======================================================

        return {
            "challenge_id": challenge.id,
            "type": challenge.type,
            "language": challenge.language,
            "difficulty": challenge.difficulty,
            "title": challenge.title,
            "description": challenge.description,
            "content": safe_content,
            "points_reward": challenge.points_reward,
            "user_level": user_level,
            "difficulty_info": difficulty_info,
            "remaining_questions": max(
                0,
                10 - user.daily_question_count
            ),
        }

    except Exception as e:

        print("CHALLENGE GENERATION ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"AI generation failed: {str(e)}"
        )


# ======================================================
# GET CHALLENGE
# ======================================================

@router.get("/{challenge_id}")
async def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db)
):

    challenge = db.query(Challenge).filter(
        Challenge.id == challenge_id
    ).first()

    if not challenge:

        raise HTTPException(
            status_code=404,
            detail="Challenge not found"
        )

    # ======================================================
    # SAFE CONTENT
    # ======================================================

    safe_content = {}

    if challenge.type == "BUG_FIX":

        safe_content = {
            "faulty_code_lines": challenge.ai_generated_content.get(
                "faulty_code_lines",
                []
            ),

            "hints": challenge.ai_generated_content.get(
                "hints",
                []
            )
        }

    elif challenge.type == "CODING_TASK":

        safe_content = {
            "example_input": challenge.ai_generated_content.get(
                "example_input"
            ),

            "example_output": challenge.ai_generated_content.get(
                "example_output"
            ),

            "hints": challenge.ai_generated_content.get(
                "hints",
                []
            )
        }

    elif challenge.type == "SYSTEM_DESIGN":

        safe_content = {
            "requirements": challenge.ai_generated_content.get(
                "requirements",
                []
            ),

            "hints": challenge.ai_generated_content.get(
                "hints",
                []
            )
        }

    return {
        "id": challenge.id,
        "type": challenge.type,
        "language": challenge.language,
        "difficulty": challenge.difficulty,
        "title": challenge.title,
        "description": challenge.description,
        "content": safe_content,
        "points_reward": challenge.points_reward
    }