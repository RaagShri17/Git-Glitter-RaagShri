from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    analytics, auth, chatbot, checkin, notifications, planner,
    quiz, sessions, syllabus, triage, weakzone,
)

app = FastAPI(
    title="Studiora API",
    description="Backend API for Studiora — The AI Study Agent That Actually Thinks With You",
    version="0.1.0",
)

# NOTE for Person 1 (Frontend): tighten allow_origins to your actual
# dev/prod URLs before the final demo/deploy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(syllabus.router)
app.include_router(checkin.router)
app.include_router(sessions.router)
app.include_router(planner.router)
app.include_router(weakzone.router)
app.include_router(quiz.router)
app.include_router(triage.router)
app.include_router(chatbot.router)
app.include_router(analytics.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Studiora API", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
