"""
Weak Zone Radar endpoint.

NOTE: The scoring/analysis logic itself (analyse_topic_performance,
confidence_matrix_position) lives in app/services/weak_zone.py and is used
by quiz.py and analytics.py to compute and store weak topics. This module
exposes that stored data over HTTP as GET /weakzones, which the frontend's
Dashboard and Weak Zone Radar views depend on.
"""
from typing import List

from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import WeakTopicOut

router = APIRouter(tags=["weak zones"])


@router.get("/weakzones", response_model=List[WeakTopicOut])
def get_weak_zones(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    topics = {t["id"]: t for t in db.list_topics(user_id)}
    weak_topics = db.list_weak_topics(user_id)

    return [
        WeakTopicOut(
            topic_id=w["topic_id"],
            topic_name=topics.get(w["topic_id"], {}).get("name"),
            reason=w["reason"],
            severity=w["severity"],
        )
        for w in weak_topics
    ]
