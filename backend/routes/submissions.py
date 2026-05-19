from fastapi import APIRouter, Depends, HTTPException
from services.clerk_auth import verify_clerk_token
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.challenge import Challenge
from models.submission import Submission
from services.ai_service import (
    evaluate_code_submission,
    evaluate_bug_fix,
    evaluate_system_design
)
from services.points_service import (
    add_points,
    update_streak,
    get_user_difficulty,
    calculate_time_bonus,
    update_language_mastery
)
from services.code_executor import execute_code
from pydantic import BaseModel

router = APIRouter(prefix="/submissions", tags=["submissions"])


class CodeSubmissionRequest(BaseModel):
    challenge_id: int
    submitted_code: str
    time_taken_seconds: int


class SystemDesignSubmissionRequest(BaseModel):
   
    challenge_id: int
    answer_text: str
    time_taken_seconds: int


@router.post("/code")
async def submit_code(request: CodeSubmissionRequest, token_payload=Depends(verify_clerk_token),
db: Session = Depends(get_db)):
    clerk_id = token_payload["sub"]

    user = db.query(User).filter(
        User.clerk_id == clerk_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    challenge = db.query(Challenge).filter(Challenge.id == request.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    difficulty_info = get_user_difficulty(user.total_points)

    # Execute code safely via Piston API
    execution_result = await execute_code(request.submitted_code, challenge.language)

    # AI evaluates the submission
    ai_feedback = evaluate_code_submission(
        task_description=challenge.description,
        language=challenge.language,
        user_code=request.submitted_code,
        user_level=difficulty_info["level"]
    )

    is_correct = ai_feedback.get("is_correct", False)
    score = ai_feedback.get("score", 0)

    # Save submission to DB
    submission = Submission(
        user_id=user.id,
        challenge_id=challenge.id,
        submitted_code=request.submitted_code,
        ai_feedback=ai_feedback,
        score=score,
        is_correct=is_correct,
        time_taken_seconds=request.time_taken_seconds
    )
    db.add(submission)
    db.commit()

    level_result = None
    time_bonus = 0
    total_earned = 0

    if is_correct:
        update_streak(db, user.id)
        level_result = add_points(
            db, user.id, challenge.points_reward,
            f"Solved: {challenge.title}"
        )
        total_earned += challenge.points_reward

        # Time-based bonus
        time_bonus = calculate_time_bonus(request.time_taken_seconds)
        if time_bonus > 0:
            add_points(db, user.id, time_bonus, f"Speed bonus: {challenge.title}")
            total_earned += time_bonus

        # Update language mastery
        update_language_mastery(db, user.id, challenge.language, challenge.points_reward)

    return {
        "submission_id": submission.id,
        "is_correct": is_correct,
        "score": score,
        "ai_feedback": ai_feedback,
        "execution_result": execution_result,
        "points_earned": challenge.points_reward if is_correct else 0,
        "time_bonus": time_bonus,
        "total_earned": total_earned,
        "level_result": level_result,
        "time_taken_seconds": request.time_taken_seconds
    }


@router.post("/bugfix")
async def submit_bugfix(
    request: CodeSubmissionRequest,
    token_payload=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    clerk_id = token_payload["sub"]

    # =========================
    # FIND USER
    # =========================

    user = db.query(User).filter(
        User.clerk_id == clerk_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # =========================
    # FIND CHALLENGE
    # =========================

    challenge = db.query(Challenge).filter(
        Challenge.id == request.challenge_id
    ).first()

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found"
        )

    # =========================
    # PREVENT DUPLICATE REWARDS
    # =========================

    existing_submission = db.query(Submission).filter(
        Submission.user_id == user.id,
        Submission.challenge_id == challenge.id,
        Submission.is_correct == True
    ).first()

    if existing_submission:
        raise HTTPException(
            status_code=400,
            detail="You already solved this challenge"
        )

    # =========================
    # LOAD CHALLENGE CONTENT
    # =========================

    content = challenge.ai_generated_content

    difficulty_info = get_user_difficulty(
        user.total_points
    )

    # =========================
    # EXECUTE CODE
    # =========================

    execution_result = await execute_code(
        request.submitted_code,
        challenge.language
    )

    has_execution_error = (
        execution_result.get("compile_error")
        or execution_result.get("runtime_error")
    )

    # =========================
    # AI EVALUATION
    # =========================

    ai_feedback = evaluate_bug_fix(
        original_faulty_code="\n".join(
            content.get("faulty_code_lines", [])
        ),
        bugs_present=content.get("bugs_present", []),
        user_fixed_code=request.submitted_code,
        language=challenge.language
    )

    score = ai_feedback.get("score", 0)

    # =========================
    # ACCEPTANCE LOGIC
    # =========================

    is_fixed = score >= 60

    # =========================
    # FINAL NORMALIZATION
    # =========================

    if has_execution_error:

        is_fixed = False

        ai_feedback["is_fixed"] = False

        ai_feedback["feedback"] = (
            "Your code still contains syntax/runtime errors."
        )

    else:

        ai_feedback["is_fixed"] = is_fixed

    # =========================
    # SAVE SUBMISSION
    # =========================

    submission = Submission(
        user_id=user.id,
        challenge_id=challenge.id,
        submitted_code=request.submitted_code,
        ai_feedback=ai_feedback,
        score=score,
        is_correct=is_fixed,
        time_taken_seconds=request.time_taken_seconds
    )

    db.add(submission)

    db.commit()

    db.refresh(submission)

    # =========================
    # REWARD SYSTEM
    # =========================

    level_result = None

    time_bonus = 0

    total_earned = 0

    if is_fixed:

        update_streak(
            db,
            user.id
        )

        level_result = add_points(
            db,
            user.id,
            challenge.points_reward,
            f"Fixed bugs: {challenge.title}"
        )

        total_earned += challenge.points_reward

        # =========================
        # SPEED BONUS
        # =========================

        time_bonus = calculate_time_bonus(
            request.time_taken_seconds
        )

        if time_bonus > 0:

            add_points(
                db,
                user.id,
                time_bonus,
                f"Speed bonus: {challenge.title}"
            )

            total_earned += time_bonus

        # =========================
        # LANGUAGE MASTERY
        # =========================

        update_language_mastery(
            db,
            user.id,
            challenge.language,
            challenge.points_reward
        )

    # =========================
    # RESPONSE
    # =========================

    return {
        "submission_id": submission.id,
        "is_fixed": is_fixed,
        "score": score,
        "ai_feedback": ai_feedback,
        "execution_result": execution_result,
        "points_earned": (
            challenge.points_reward
            if is_fixed else 0
        ),
        "time_bonus": time_bonus,
        "total_earned": total_earned,
        "level_result": level_result
    }


@router.post("/system-design")
async def submit_system_design(
    request: SystemDesignSubmissionRequest,
    token_payload=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    clerk_id = token_payload["sub"]

    user = db.query(User).filter(
        User.clerk_id == clerk_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    challenge = db.query(Challenge).filter(
        Challenge.id == request.challenge_id
    ).first()

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found"
        )

    # =========================
    # CHECK DUPLICATE SUBMISSION
    # =========================

    existing_submission = db.query(Submission).filter(
        Submission.user_id == user.id,
        Submission.challenge_id == challenge.id,
        Submission.is_correct == True
    ).first()

    if existing_submission:
        raise HTTPException(
            status_code=400,
            detail="You have already solved this challenge"
        )

    # =========================

    content = challenge.ai_generated_content

    difficulty_info = get_user_difficulty(
        user.total_points
    )

    ai_feedback = evaluate_system_design(
        scenario=content.get("scenario", ""),
        requirements=content.get("requirements", []),
        user_answer=request.answer_text,
        user_level=difficulty_info["level"]
    )

    score = ai_feedback.get("score", 0)

    is_correct = score >= 60

    submission = Submission(
        user_id=user.id,
        challenge_id=challenge.id,
        submitted_code=request.answer_text,
        ai_feedback=ai_feedback,
        score=score,
        is_correct=is_correct,
        time_taken_seconds=request.time_taken_seconds
    )

    db.add(submission)
    db.commit()

    level_result = None
    time_bonus = 0
    total_earned = 0

    if is_correct:
        update_streak(db, user.id)

        level_result = add_points(
            db,
            user.id,
            challenge.points_reward,
            f"System Design: {challenge.title}"
        )

        total_earned += challenge.points_reward

        time_bonus = calculate_time_bonus(
            request.time_taken_seconds
        )

        if time_bonus > 0:
            add_points(
                db,
                user.id,
                time_bonus,
                f"Speed bonus: {challenge.title}"
            )

            total_earned += time_bonus

    return {
        "submission_id": submission.id,
        "score": score,
        "is_correct": is_correct,
        "ai_feedback": ai_feedback,
        "points_earned": challenge.points_reward if is_correct else 0,
        "time_bonus": time_bonus,
        "total_earned": total_earned,
        "level_result": level_result
    }