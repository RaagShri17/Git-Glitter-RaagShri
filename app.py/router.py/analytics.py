import datetime

from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import AnalyticsSummaryOut

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummaryOut)
def get_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    sessions = db.list_sessions(user_id)
    quiz_results = db.list_quiz_results(user_id)
    weak_topics = db.list_weak_topics(user_id)
    topics = db.list_topics(user_id)

    total_minutes = sum(s["duration_minutes"] for s in sessions)
    avg_score = (
        round(sum(r["score_pct"] for r in quiz_results) / len(quiz_results), 1)
        if quiz_results else None
    )
    mastered = len([t for t in topics if t.get("status") == "mastered"])

    study_days = {datetime.datetime.fromtimestamp(s["timestamp"]).date() for s in sessions}
    streak = 0
    d = datetime.date.today()
    while d in study_days:
        streak += 1
        d -= datetime.timedelta(days=1)

    return AnalyticsSummaryOut(
        total_study_minutes=total_minutes,
        sessions_logged=len(sessions),
        avg_quiz_score=avg_score,
        weak_topic_count=len(weak_topics),
        topics_mastered=mastered,
        current_streak_days=streak,
    )
