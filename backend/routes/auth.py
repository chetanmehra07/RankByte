from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db

from models.user import User
from models.submission import Submission
from models.points import PointTransaction
from models.language_mastery import LanguageMastery
from models.daily_challenge import DailyChallengeCompletion

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


# ======================================================
# CLERK WEBHOOK
# ======================================================

@router.post("/webhook")
async def clerk_webhook(
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        payload = await request.json()

        event_type = payload.get("type")

        data = payload.get("data", {})

        # ======================================================
        # USER CREATED
        # ======================================================

        if event_type == "user.created":

            clerk_id = data.get("id")

            first_name = data.get("first_name") or ""

            last_name = data.get("last_name") or ""

            full_name = f"{first_name} {last_name}".strip()

            username = (
                full_name
                or data.get("username")
            )

            email = (
                data.get("email_addresses", [{}])[0]
                .get("email_address", "")
            )

            # fallback from email
            if not username and email:
                username = email.split("@")[0]

            # final fallback
            if not username:
                username = "User"

            existing = (
                db.query(User)
                .filter(User.clerk_id == clerk_id)
                .first()
            )

            if not existing:

                user = User(
                    clerk_id=clerk_id,
                    username=username,
                    email=email
                )

                db.add(user)

                db.commit()

                db.refresh(user)

            return {
                "message": "User created"
            }

        # ======================================================
        # USER UPDATED
        # ======================================================

        elif event_type == "user.updated":

            clerk_id = data.get("id")

            first_name = data.get("first_name") or ""

            last_name = data.get("last_name") or ""

            full_name = f"{first_name} {last_name}".strip()

            username = (
                full_name
                or data.get("username")
            )

            email = (
                data.get("email_addresses", [{}])[0]
                .get("email_address", "")
            )

            # fallback from email
            if not username and email:
                username = email.split("@")[0]

            # final fallback
            if not username:
                username = "User"

            user = (
                db.query(User)
                .filter(User.clerk_id == clerk_id)
                .first()
            )

            if user:

                user.username = username

                if email:
                    user.email = email

                db.commit()

                db.refresh(user)

            return {
                "message": "User updated"
            }

        # ======================================================
        # USER DELETED
        # ======================================================

        elif event_type == "user.deleted":

            clerk_id = data.get("id")

            user = (
                db.query(User)
                .filter(User.clerk_id == clerk_id)
                .first()
            )

            if user:

                # delete dependent records first

                db.query(Submission).filter(
                    Submission.user_id == user.id
                ).delete()

                db.query(PointTransaction).filter(
                    PointTransaction.user_id == user.id
                ).delete()

                db.query(LanguageMastery).filter(
                    LanguageMastery.user_id == user.id
                ).delete()

                db.query(DailyChallengeCompletion).filter(
                    DailyChallengeCompletion.user_id == user.id
                ).delete()

                # delete user

                db.delete(user)

                db.commit()

            return {
                "message": "User deleted"
            }

        # ======================================================
        # IGNORED EVENTS
        # ======================================================

        return {
            "message": f"Ignored event: {event_type}"
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )