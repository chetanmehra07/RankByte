from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from models.user import User

from services.clerk_auth import verify_clerk_token


router = APIRouter(
    prefix="/user",
    tags=["user"]
)


# ======================================================
# SYNC CLERK USER
# ======================================================

@router.post("/sync-user")
async def sync_user(
    data: dict,
    token_payload=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):

    print("SYNC ROUTE HIT")

    print("TOKEN:", token_payload)

    clerk_id = token_payload["sub"]

    print("CLERK ID:", clerk_id)

    user = (
        db.query(User)
        .filter(User.clerk_id == clerk_id)
        .first()
    )

    print("USER FOUND:", user)

    if user:

        print("OLD USERNAME:", user.username)

        user.username = data.get(
            "username",
            user.username
        )

        print("NEW USERNAME:", user.username)

        db.commit()

        db.refresh(user)

        print("DB UPDATED")

    return {
        "success": True
    }