from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import QuizResultOut, QuizSubmission
from app.services import weak_zone

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/submit", response_model=QuizResultOut)
def submit_quiz(payload: QuizSubmission, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    result = db.add_quiz_result(user_id, payload.topic_id, payload.score_pct, payload.error_tags)

    topic_results = db.list_quiz_results(user_id, payload.topic_id)
    analysis = weak_zone.analyse_topic_performance(topic_results)
    if analysis["is_weak"]:
        db.upsert_weak_topic(user_id, payload.topic_id, analysis["reason"], analysis["severity"])

    return QuizResultOut(
        id=result["id"], topic_id=result["topic_id"],
        score_pct=result["score_pct"], error_tags=result["error_tags"],
    )
