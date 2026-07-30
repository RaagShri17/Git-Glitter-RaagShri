import os


class Settings:
    SECRET_KEY: str = os.getenv("STUDIORA_SECRET_KEY", "dev-secret-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    ENV: str = os.getenv("STUDIORA_ENV", "development")


settings = Settings()
