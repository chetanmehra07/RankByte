from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    DATABASE_URL: str

    GROQ_API_KEY: str

    SECRET_KEY: str | None = None

    CLERK_SECRET_KEY: str | None = None

    CLERK_PUBLISHABLE_KEY: str | None = None

    CLERK_JWT_ISSUER: str | None = None

    class Config:
        env_file = ".env"


settings = Settings()