from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import ConfidenceMatrixOut, QuizResultOut, QuizSubmission
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

    # --- Confidence Matrix: compare self-reported confidence vs this score ---
    confidence_matrix = None
    topic = db.get_topic(payload.topic_id)
    if topic is not None:
        matrix = weak_zone.confidence_matrix_position(topic["confidence"], payload.score_pct)
        confidence_matrix = ConfidenceMatrixOut(
            topic_id=topic["id"], topic_name=topic["name"],
            quadrant=matrix["quadrant"], gap=matrix["gap"], message=matrix["message"],
        )

    return QuizResultOut(
        id=result["id"], topic_id=result["topic_id"],
        score_pct=result["score_pct"], error_tags=result["error_tags"],
        confidence_matrix=confidence_matrix,
    )
