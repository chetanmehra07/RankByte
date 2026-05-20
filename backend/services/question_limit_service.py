from datetime import datetime, timezone
from sqlalchemy.orm import Session

from models.user import User

DAILY_QUESTION_LIMIT = 10


# ======================================================
# CHECK DAILY LIMIT
# ======================================================

def check_daily_question_limit(
    db: Session,
    user_id: int
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:

        return {
            "allowed": False,
            "remaining": 0
        }

    # ======================================================
    # CURRENT UTC DATE
    # ======================================================

    today = datetime.now(timezone.utc).date()

    # ======================================================
    # FIRST TIME USER
    # ======================================================

    if user.last_question_reset is None:

        user.last_question_reset = datetime.now(
            timezone.utc
        )

        user.daily_question_count = 0

        db.commit()

        db.refresh(user)

    # ======================================================
    # RESET IF NEW DAY
    # ======================================================

    elif user.last_question_reset.date() != today:

        

        user.daily_question_count = 0

        user.last_question_reset = datetime.now(
            timezone.utc
        )

        db.commit()

        db.refresh(user)

    # ======================================================
    # LIMIT REACHED
    # ======================================================

    if user.daily_question_count >= DAILY_QUESTION_LIMIT:

        return {
            "allowed": False,
            "remaining": 0
        }

    return {
        "allowed": True,
        "remaining":
        DAILY_QUESTION_LIMIT
        - user.daily_question_count
    }


# ======================================================
# INCREMENT QUESTION COUNT
# ======================================================

def increment_daily_question_count(
    db: Session,
    user_id: int
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        return

    # ======================================================
    # INCREMENT
    # ======================================================

    user.daily_question_count += 1

    # IMPORTANT
    user.last_question_reset = datetime.now(
        timezone.utc
    )

    

    db.commit()

    db.refresh(user)

   