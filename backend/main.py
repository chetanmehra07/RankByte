from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
import os

load_dotenv()


from database import create_tables
from routes.challenges import router as challenge_router

# Import ALL models
from models.user import User
from models.challenge import Challenge
from models.submission import Submission
from models.points import PointTransaction
from models.language_mastery import LanguageMastery
from models.daily_challenge import DailyChallenge

from routes.submissions import router as submission_router
from routes.history import router as history_router
from routes.daily import router as daily_router
from routes.hints import router as hints_router
from routes.leaderboard import router as leaderboard_router
from routes.auth import router as auth_router
from routes.user_routes import router as user_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

create_tables()

app.include_router(challenge_router)
app.include_router(submission_router)
app.include_router(history_router)
app.include_router(hints_router)
app.include_router(daily_router)
app.include_router(leaderboard_router)
app.include_router(auth_router)
app.include_router(user_router)

@app.get("/")
def root():
    return {
        "message": "Backend running"
    }