from sqlalchemy.orm import Session
from models.user import User
from models.points import PointTransaction
from models.language_mastery import LanguageMastery
from datetime import datetime, date


def get_language_difficulty(
    db: Session,
    user_id: int,
    language: str
) -> dict:

    mastery = db.query(LanguageMastery).filter(
        LanguageMastery.user_id == user_id,
        LanguageMastery.language == language
    ).first()

    # No mastery yet
    if not mastery:

        return {
            "level": "Beginner",
            "difficulty": "Easy",
            "points_multiplier": 1.0,
            "next_level_points": 50,
            "bug_count": "1-2 simple bugs (syntax errors, wrong variable names)"
        }

    lang_points = mastery.points

    # Beginner
    if lang_points <= 50:

        return {
            "level": "Beginner",
            "difficulty": "Easy",
            "points_multiplier": 1.0,
            "next_level_points": 50,
            "bug_count": "1-2 simple bugs (syntax errors, wrong variable names)"
        }

    # Intermediate
    elif lang_points <= 150:

        return {
            "level": "Intermediate",
            "difficulty": "Medium",
            "points_multiplier": 1.5,
            "next_level_points": 150,
            "bug_count": "2-3 bugs (logic + syntax)"
        }

    # Advanced
    elif lang_points <= 400:

        return {
            "level": "Advanced",
            "difficulty": "Medium-Hard",
            "points_multiplier": 2.0,
            "next_level_points": 400,
            "bug_count": "3-4 bugs (logic + edge cases)"
        }

    # Expert
    else:

        return {
            "level": "Expert",
            "difficulty": "Hard",
            "points_multiplier": 2.5,
            "next_level_points": None,
            "bug_count": "4-5 bugs (complex logic, performance, edge cases)"
        }

def get_user_difficulty(total_points: int) -> dict:
    if total_points <= 100:
        return {
            "level": "Beginner",
            "difficulty": "Easy",
            "points_multiplier": 1.0,
            "next_level_points": 100,
            "bug_count": "1-2 simple bugs (syntax errors, wrong variable names)"
        }
    elif total_points <= 300:
        return {
            "level": "Developer",
            "difficulty": "Medium",
            "points_multiplier": 1.5,
            "next_level_points": 300,
            "bug_count": "2-3 bugs (logic errors + syntax)"
        }
    elif total_points <= 700:
        return {
            "level": "Pro",
            "difficulty": "Medium-Hard",
            "points_multiplier": 2.0,
            "next_level_points": 700,
            "bug_count": "3-4 bugs (logic + edge cases)"
        }
    elif total_points <= 1500:
        return {
            "level": "Expert",
            "difficulty": "Hard",
            "points_multiplier": 2.5,
            "next_level_points": 1500,
            "bug_count": "4-5 bugs (complex logic, algorithm errors, edge cases)"
        }
    else:
        return {
            "level": "Master",
            "difficulty": "Hard-Complex",
            "points_multiplier": 3.0,
            "next_level_points": None,
            "bug_count": "4-5 bugs (complex logic, performance issues, edge cases)"
        }


def get_language_level(lang_points: int) -> str:
    if lang_points <= 50:
        return "Beginner"
    elif lang_points <= 150:
        return "Intermediate"
    elif lang_points <= 400:
        return "Advanced"
    else:
        return "Expert"


def calculate_time_bonus(time_taken_seconds: int) -> int:
    if time_taken_seconds <= 300:    # under 5 mins
        return 10
    elif time_taken_seconds <= 600:  # under 10 mins
        return 5
    elif time_taken_seconds <= 900:  # under 15 mins
        return 2
    return 0


def update_user_level(user: User) -> str:
    return get_user_difficulty(user.total_points)["level"]


from datetime import datetime, date

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

    # prevent duplicate streak bonus
    if reason == "Daily streak bonus":

        today = date.today()

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

    user.total_points = max(
        0,
        user.total_points + points
    )

    user.level = update_user_level(user)

    transaction = PointTransaction(
        user_id=user_id,
        points_earned=points,
        reason=reason
    )

    db.add(transaction)

    leveled_up = old_level != user.level

    db.commit()

    db.refresh(user)

    return {
        "new_total": user.total_points,
        "new_level": user.level,
        "leveled_up": leveled_up,
        "old_level": old_level
    }
def deduct_points(db: Session, user_id: int, points: int, reason: str) -> dict:
    return add_points(db, user_id, -points, reason)


def update_language_mastery(db: Session, user_id: int, language: str, points_earned: int):
    mastery = db.query(LanguageMastery).filter(
        LanguageMastery.user_id == user_id,
        LanguageMastery.language == language
    ).first()

    if not mastery:
        mastery = LanguageMastery(
            user_id=user_id,
            language=language,
            points=0,
            challenges_solved=0
        )
        db.add(mastery)

    mastery.points += points_earned
    mastery.challenges_solved += 1
    mastery.level = get_language_level(mastery.points)
    mastery.updated_at = datetime.utcnow()
    db.commit()


from datetime import datetime, date

def update_streak(db: Session, user_id: int):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "bonus_given": False,
            "streak_days": 0
        }

    today = date.today()

    last_active_date = (
        user.last_active.date()
        if user.last_active
        else None
    )

    # already updated today
    if last_active_date == today:
        return {
            "bonus_given": False,
            "streak_days": user.streak_days
        }

    # consecutive day
    if (
        last_active_date and
        (today - last_active_date).days == 1
    ):
        user.streak_days += 1

    else:
        user.streak_days = 1

    add_points(
        db,
        user_id,
        5,
        "Daily streak bonus"
    )

    user.last_active = datetime.utcnow()

    db.commit()

    return {
        "bonus_given": True,
        "streak_days": user.streak_days
    }

def get_language_mastery_all(db: Session, user_id: int) -> list:
    return db.query(LanguageMastery).filter(
        LanguageMastery.user_id == user_id
    ).all()