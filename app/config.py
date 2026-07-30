import os


class Settings:
    SECRET_KEY: str = os.getenv("STUDIORA_SECRET_KEY", "dev-secret-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    ENV: str = os.getenv("STUDIORA_ENV", "development")

    # Flora chatbot / syllabus parsing — Claude API
    # Without ANTHROPIC_API_KEY, Flora and the PDF parser fall back to
    # heuristic stubs so the app still runs end-to-end for a demo.
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("STUDIORA_ANTHROPIC_MODEL", "claude-sonnet-5")


settings = Settings()
