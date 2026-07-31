import datetime

from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import (
    AnalyticsSummaryOut, ConfidenceMatrixOut, ConfidenceMatrixSummaryOut,
)
from app.services import weak_zone

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


@router.get("/confidence-matrix", response_model=ConfidenceMatrixSummaryOut)
def get_confidence_matrix(current_user: dict = Depends(get_current_user)):
    """
    For every topic with at least one quiz result, compares the student's
    self-reported confidence against their most recent quiz score and
    groups topics into 4 quadrants. 'danger_zone' is the headline signal:
    topics the student feels sure about but is actually weak in.
    """
    user_id = current_user["id"]
    topics = db.list_topics(user_id)

    summary = ConfidenceMatrixSummaryOut()
    for topic in topics:
        results = db.list_quiz_results(user_id, topic["id"])
        if not results:
            continue  # no quiz data yet -> can't compute a matrix position
        latest_score = sorted(results, key=lambda r: r["timestamp"])[-1]["score_pct"]

        matrix = weak_zone.confidence_matrix_position(topic["confidence"], latest_score)
        entry = ConfidenceMatrixOut(
            topic_id=topic["id"], topic_name=topic["name"],
            quadrant=matrix["quadrant"], gap=matrix["gap"], message=matrix["message"],
        )
        getattr(summary, matrix["quadrant"]).append(entry)

    return summary
