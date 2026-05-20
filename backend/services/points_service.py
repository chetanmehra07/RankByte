from sqlalchemy.orm import Session

from models.user import User
from models.points import PointTransaction
from models.language_mastery import LanguageMastery


from datetime import datetime, date
from zoneinfo import ZoneInfo
IST = ZoneInfo("Asia/Kolkata")


def get_ist_now():
    return datetime.now(IST)


def get_ist_today():
    return get_ist_now().date()

# ======================================================
# LANGUAGE DIFFICULTY
# ======================================================

def get_language_difficulty(
    db: Session,
    user_id: int,
    language: str
) -> dict:

    mastery = db.query(LanguageMastery).filter(
        LanguageMastery.user_id == user_id,
        LanguageMastery.language == language.lower()
    ).first()

    # ======================================================
    # NO MASTERY YET
    # ======================================================

    if not mastery:

        return {
            "level": "Beginner",
            "difficulty": "Easy",
            "points_multiplier": 1.0,
            "next_level_points": 50,
            "bug_count":
                "1-2 simple bugs (syntax errors, wrong variable names)"
        }

    lang_points = mastery.points

    # ======================================================
    # BEGINNER
    # ======================================================

    if lang_points <= 50:

        return {
            "level": "Beginner",
            "difficulty": "Easy",
            "points_multiplier": 1.0,
            "next_level_points": 50,
            "bug_count":
                "1-2 simple bugs (syntax errors, wrong variable names)"
        }

    # ======================================================
    # INTERMEDIATE
    # ======================================================

    elif lang_points <= 150:

        return {
            "level": "Intermediate",
            "difficulty": "Medium",
            "points_multiplier": 1.5,
            "next_level_points": 150,
            "bug_count":
                "2-3 bugs (logic + syntax)"
        }

    # ======================================================
    # ADVANCED
    # ======================================================

    elif lang_points <= 400:

        return {
            "level": "Advanced",
            "difficulty": "Medium-Hard",
            "points_multiplier": 2.0,
            "next_level_points": 400,
            "bug_count":
                "3-4 bugs (logic + edge cases)"
        }

    # ======================================================
    # EXPERT
    # ======================================================

    else:

        return {
            "level": "Expert",
            "difficulty": "Hard",
            "points_multiplier": 2.5,
            "next_level_points": None,
            "bug_count":
                "4-5 bugs (complex logic, performance, edge cases)"
        }


# ======================================================
# USER DIFFICULTY
# ======================================================

def get_user_difficulty(
    total_points: int
) -> dict:

    if total_points <= 100:

        return {
            "level": "Beginner",
            "difficulty": "Easy",
            "points_multiplier": 1.0,
            "next_level_points": 100,
            "bug_count":
                "1-2 simple bugs (syntax errors, wrong variable names)"
        }

    elif total_points <= 300:

        return {
            "level": "Developer",
            "difficulty": "Medium",
            "points_multiplier": 1.5,
            "next_level_points": 300,
            "bug_count":
                "2-3 bugs (logic errors + syntax)"
        }

    elif total_points <= 700:

        return {
            "level": "Pro",
            "difficulty": "Medium-Hard",
            "points_multiplier": 2.0,
            "next_level_points": 700,
            "bug_count":
                "3-4 bugs (logic + edge cases)"
        }

    elif total_points <= 1500:

        return {
            "level": "Expert",
            "difficulty": "Hard",
            "points_multiplier": 2.5,
            "next_level_points": 1500,
            "bug_count":
                "4-5 bugs (complex logic, algorithm errors, edge cases)"
        }

    else:

        return {
            "level": "Master",
            "difficulty": "Hard-Complex",
            "points_multiplier": 3.0,
            "next_level_points": None,
            "bug_count":
                "4-5 bugs (complex logic, performance issues, edge cases)"
        }


# ======================================================
# LANGUAGE LEVEL
# ======================================================

def get_language_level(
    lang_points: int
) -> str:

    if lang_points <= 50:
        return "Beginner"

    elif lang_points <= 150:
        return "Intermediate"

    elif lang_points <= 400:
        return "Advanced"

    else:
        return "Expert"


# ======================================================
# TIME BONUS
# ======================================================

def calculate_time_bonus(
    time_taken_seconds: int
) -> int:

    if time_taken_seconds <= 300:
        return 10

    elif time_taken_seconds <= 600:
        return 5

    elif time_taken_seconds <= 900:
        return 2

    return 0


# ======================================================
# UPDATE USER LEVEL
# ======================================================

def update_user_level(
    user: User
) -> str:

    return get_user_difficulty(
        user.total_points
    )["level"]


# ======================================================
# ADD POINTS
# ======================================================

def add_points(
    db: Session,
    user_id: int,
    points: int,
    reason: str
) -> dict:

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise ValueError("User not found")

    # ======================================================
    # PREVENT DUPLICATE STREAK BONUS
    # ======================================================

    if reason == "Daily streak bonus":

        today = get_ist_today()

        existing_bonus = db.query(
            PointTransaction
        ).filter(
            PointTransaction.user_id == user_id,
            PointTransaction.reason == reason,
            PointTransaction.created_at >= datetime.combine(
                today,
                datetime.min.time()
            )
        ).first()

        if existing_bonus:

            return {
                "new_total": user.total_points,
                "new_level": user.level,
                "leveled_up": False,
                "old_level": user.level
            }

    old_level = user.level

    # ======================================================
    # UPDATE USER
    # ======================================================

    user.total_points = max(
        0,
        user.total_points + points
    )

    user.level = update_user_level(user)

    # ======================================================
    # TRANSACTION
    # ======================================================

    transaction = PointTransaction(
        user_id=user_id,
        points_earned=points,
        reason=reason
    )

    db.add(transaction)

    leveled_up = old_level != user.level

    try:

        db.commit()

        db.refresh(user)

    except Exception:

        db.rollback()

        raise

    return {
        "new_total": user.total_points,
        "new_level": user.level,
        "leveled_up": leveled_up,
        "old_level": old_level
    }


# ======================================================
# DEDUCT POINTS
# ======================================================

def deduct_points(
    db: Session,
    user_id: int,
    points: int,
    reason: str
) -> dict:

    return add_points(
        db,
        user_id,
        -points,
        reason
    )


# ======================================================
# UPDATE LANGUAGE MASTERY
# ======================================================

def update_language_mastery(
    db: Session,
    user_id: int,
    language: str,
    points_earned: int
):

    normalized_language = language.lower()

    mastery = db.query(LanguageMastery).filter(
        LanguageMastery.user_id == user_id,
        LanguageMastery.language == normalized_language
    ).first()

    # ======================================================
    # CREATE NEW
    # ======================================================

    if not mastery:

        mastery = LanguageMastery(
            user_id=user_id,
            language=normalized_language,
            points=0,
            challenges_solved=0
        )

        db.add(mastery)

    # ======================================================
    # UPDATE
    # ======================================================

    mastery.points += points_earned

    mastery.challenges_solved += 1

    mastery.level = get_language_level(
        mastery.points
    )

    mastery.updated_at = get_ist_now()

    db.commit()


# ======================================================
# UPDATE STREAK
# ======================================================

def update_streak(
    db: Session,
    user_id: int
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        return {
            "bonus_given": False,
            "streak_days": 0
        }

    today = get_ist_today()

    last_active_date = (
        user.last_active.date()
        if user.last_active
        else None
    )

    # ======================================================
    # ALREADY UPDATED TODAY
    # ======================================================

    if last_active_date == today:

        return {
            "bonus_given": False,
            "streak_days": user.streak_days
        }

    # ======================================================
    # CONSECUTIVE DAY
    # ======================================================

    # FIRST TIME USER
    if not last_active_date:

        user.streak_days = 1
        give_bonus = True

    # CONSECUTIVE DAY
    elif (today - last_active_date).days == 1:

        user.streak_days += 1
        give_bonus = True

    # MISSED DAY
    else:

        user.streak_days = 1
        give_bonus = False

    # ======================================================
    # STREAK BONUS
    # ======================================================

    if give_bonus:

        transaction = PointTransaction(
            user_id=user_id,
            points_earned=5,
            reason="Daily streak bonus"
        )

        db.add(transaction)

        user.total_points += 5

    user.level = update_user_level(user)

    user.last_active = get_ist_now()

    db.commit()

    return {
        "bonus_given": True,
        "streak_days": user.streak_days
    }

# ======================================================
# GET ALL LANGUAGE MASTERY
# ======================================================

def get_language_mastery_all(
    db: Session,
    user_id: int
) -> list:

    return db.query(LanguageMastery).filter(
        LanguageMastery.user_id == user_id
    ).all()