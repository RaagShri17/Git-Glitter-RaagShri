from typing import List

from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import WeakTopicOut

router = APIRouter(prefix="/weakzones", tags=["weak zones"])


@router.get("", response_model=List[WeakTopicOut])
def get_weak_zones(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    topics_by_id = {t["id"]: t["name"] for t in db.list_topics(user_id)}
    weak = db.list_weak_topics(user_id)
    return [
        WeakTopicOut(
            topic_id=w["topic_id"], topic_name=topics_by_id.get(w["topic_id"]),
            reason=w["reason"], severity=w["severity"],
        )
        for w in weak
    ]
