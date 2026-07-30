from typing import List

from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import TriageResultOut
from app.services import triage_engine

router = APIRouter(prefix="/triage", tags=["exam triage"])


@router.get("", response_model=List[TriageResultOut])
def get_triage(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    topics = db.list_topics(user_id)
    subjects_by_id = {s["id"]: s["name"] for s in db.list_subjects(user_id)}
    results = triage_engine.triage_topics(topics, subjects_by_id)
    return [TriageResultOut(**r) for r in results]
