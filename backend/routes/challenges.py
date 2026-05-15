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
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/challenges",
    tags=["challenges"]
)


class GenerateChallengeRequest(BaseModel):
    language: Optional[str] = None
    challenge_type: str  # CODING_TASK | BUG_FIX | SYSTEM_DESIGN


@router.post("/generate")
async def generate_challenge(
    request: GenerateChallengeRequest,
    db: Session = Depends(get_db)
):
    TEST_CLERK_ID = "test_user_1"

    # =========================
    # FIND USER
    # =========================

    user = db.query(User).filter(
        User.clerk_id == TEST_CLERK_ID
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # =========================
    # USER DIFFICULTY
    # =========================

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

        # =========================
        # CODING TASK
        # =========================

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

        # =========================
        # BUG FIX
        # =========================

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

        # =========================
        # SYSTEM DESIGN
        # =========================

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

        # =========================
        # POINT CALCULATION
        # =========================

        points_reward = int(
            base_points * points_multiplier
        )

        # =========================
        # SAVE CHALLENGE
        # =========================

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

        # =========================
        # SAFE CONTENT FOR FRONTEND
        # =========================

        safe_content = {}

        # -------------------------
        # BUG FIX
        # -------------------------

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

        # -------------------------
        # CODING TASK
        # -------------------------

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

        # -------------------------
        # SYSTEM DESIGN
        # -------------------------

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

        # =========================
        # RESPONSE
        # =========================

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
            "difficulty_info": difficulty_info
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"AI generation failed: {str(e)}"
        )


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

    # =========================
    # SAFE CONTENT
    # =========================

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