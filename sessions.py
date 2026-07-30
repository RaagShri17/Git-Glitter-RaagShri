from typing import List

from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import SessionCreate, SessionOut

router = APIRouter(prefix="/sessions", tags=["study sessions"])


@router.post("", response_model=SessionOut)
def log_session(payload: SessionCreate, current_user: dict = Depends(get_current_user)):
    session = db.log_session(
        current_user["id"], payload.topic_id, payload.duration_minutes,
        payload.confidence_after, payload.notes,
    )
    return SessionOut(
        id=session["id"], topic_id=session["topic_id"],
        duration_minutes=session["duration_minutes"],
        confidence_after=session["confidence_after"], timestamp=session["timestamp"],
    )


@router.get("", response_model=List[SessionOut])
def list_sessions(current_user: dict = Depends(get_current_user)):
    return [
        SessionOut(
            id=s["id"], topic_id=s["topic_id"], duration_minutes=s["duration_minutes"],
            confidence_after=s["confidence_after"], timestamp=s["timestamp"],
        )
        for s in db.list_sessions(current_user["id"])
    ]
