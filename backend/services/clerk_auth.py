import jwt
import requests

from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session

from config import settings
from database import get_db

from models.user import User


# ======================================================
# CLERK CONFIG
# ======================================================

CLERK_ISSUER = settings.CLERK_JWT_ISSUER


JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"

jwks = requests.get(JWKS_URL).json()


# ======================================================
# GET PUBLIC KEY
# ======================================================

def get_public_key(token):

    unverified_header = jwt.get_unverified_header(token)

   

    kid = unverified_header.get("kid")

    for key in jwks["keys"]:

        if key["kid"] == kid:

            return jwt.algorithms.RSAAlgorithm.from_jwk(key)

    raise HTTPException(
        status_code=401,
        detail="Invalid token key"
    )


# ======================================================
# VERIFY CLERK TOKEN
# ======================================================

async def verify_clerk_token(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):

    # ======================================================
    # CHECK AUTH HEADER
    # ======================================================

    if not authorization:

        

        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )

    try:

        

        token = authorization.split(" ")[1]

        

        public_key = get_public_key(token)

        # ======================================================
        # DECODE JWT
        # ======================================================

        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"verify_aud": False}
        )

        

        # ======================================================
        # USER DATA
        # ======================================================

        clerk_id = payload.get("sub")

        email = payload.get("email")

        username = (
            payload.get("username")
            or payload.get("name")
            or payload.get("given_name")
            or payload.get("family_name")
        )

        # fallback from email
        if not username and email:
            username = email.split("@")[0]

        # final fallback
        if not username:
            username = "User"

       

        # ======================================================
        # FIND USER
        # ======================================================

        user = (
            db.query(User)
            .filter(User.clerk_id == clerk_id)
            .first()
        )

        # ======================================================
        # AUTO CREATE USER
        # ======================================================

        if not user:

            

            user = User(
                clerk_id=clerk_id,
                username=username,
                email=email or f"{clerk_id}@clerk.dev"
            )

            db.add(user)

            db.commit()

            db.refresh(user)

        # ======================================================
        # AUTO UPDATE USER
        # ======================================================

        else:

            updated = False

            if user.username != username:
                user.username = username
                updated = True

            if email and user.email != email:
                user.email = email
                updated = True

            if updated:

                

                db.commit()

        return payload

    except Exception as e:

        print("JWT ERROR:", str(e))

        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}"
        )