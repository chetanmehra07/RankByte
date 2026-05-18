from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db

from models.user import User
from models.points import PointTransaction
from models.submission import Submission
from models.challenge import Challenge

from services.points_service import get_user_difficulty
from services.clerk_auth import verify_clerk_token

router = APIRouter(
    prefix="/leaderboard",
    tags=["leaderboard"]
)


# ======================================================
# GLOBAL LEADERBOARD
# ======================================================

@router.get("/top")
async def get_leaderboard(
    db: Session = Depends(get_db)
):

    top_users = (
        db.query(User)
        .order_by(desc(User.total_points))
        .limit(10)
        .all()
    )

    data = [
    {
        "rank": i + 1,
        "username": u.username,
        "total_points": u.total_points,
        "level": u.level,
        "streak_days": u.streak_days
    }
    for i, u in enumerate(top_users)
]

    print("LEADERBOARD DATA:", data)

    return data

# ======================================================
# USER POINTS HISTORY
# ======================================================

@router.get("/history")
async def get_points_history(
    token_payload=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):

    clerk_id = token_payload["sub"]

    user = (
        db.query(User)
        .filter(User.clerk_id == clerk_id)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    transactions = (
        db.query(PointTransaction)
        .filter(PointTransaction.user_id == user.id)
        .order_by(desc(PointTransaction.created_at))
        .limit(20)
        .all()
    )

    return [
        {
            "points_earned": t.points_earned,
            "reason": t.reason,
            "created_at": t.created_at
        }
        for t in transactions
    ]


# ======================================================
# USER STATS
# ======================================================

@router.get("/stats")
async def get_user_stats(
    token_payload=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):

    clerk_id = token_payload["sub"]

    user = (
        db.query(User)
        .filter(User.clerk_id == clerk_id)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    submissions = (
        db.query(Submission)
        .filter(
            Submission.user_id == user.id,
            Submission.is_correct == True
        )
        .all()
    )

    correct_challenge_ids = [
        s.challenge_id
        for s in submissions
    ]

    # ======================================================
    # CODING TASKS
    # ======================================================

    coding_solved = (
        db.query(Challenge)
        .filter(
            Challenge.id.in_(correct_challenge_ids),
            Challenge.type == "CODING_TASK"
        )
        .count()
    )

    # ======================================================
    # BUG FIXES
    # ======================================================

    bugfix_solved = (
        db.query(Challenge)
        .filter(
            Challenge.id.in_(correct_challenge_ids),
            Challenge.type == "BUG_FIX"
        )
        .count()
    )

    # ======================================================
    # SYSTEM DESIGN
    # ======================================================

    design_solved = (
        db.query(Challenge)
        .filter(
            Challenge.id.in_(correct_challenge_ids),
            Challenge.type == "SYSTEM_DESIGN"
        )
        .count()
    )

    difficulty_info = get_user_difficulty(
        user.total_points
    )

    return {
        "total_points": user.total_points,

        "level": user.level,

        "streak_days": user.streak_days,

        "coding_tasks_solved": coding_solved,

        "bug_fixes_solved": bugfix_solved,

        "system_designs_solved": design_solved,

        "total_solved": (
            coding_solved
            + bugfix_solved
            + design_solved
        ),

        "difficulty_info": difficulty_info
    }