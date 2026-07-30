from typing import List, Optional

from fastapi import APIRouter, Depends, File, UploadFile

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import (
    ChatMessageOut, ChatRequest, ChatResponse, PdfAnalysisResponse,
)
from app.services import chatbot_interface, pdf_interface

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


def _build_flora_context(user_id: str) -> dict:
    """Pull the student's live Studiora data so Flora can ground her replies in it."""
    checkin = db.latest_checkin(user_id)
    weak_topics = db.list_weak_topics(user_id)
    plan = db.latest_plan(user_id)
    topics = {t["id"]: t for t in db.list_topics(user_id)}
    subjects = db.list_subjects(user_id)

    weak_named = [
        {
            "topic": topics[w["topic_id"]]["name"] if w["topic_id"] in topics else w["topic_id"],
            "reason": w["reason"],
            "severity": w["severity"],
        }
        for w in weak_topics
    ]

    return {
        "checkin": checkin,
        "weak_topics": weak_named,
        "plan_items": (plan or {}).get("items", []),
        "subject_count": len(subjects),
        "topic_count": len(topics),
    }


@router.post("/ask", response_model=ChatResponse)
def ask_flora(payload: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    history = db.list_chat(user_id)
    context = _build_flora_context(user_id)

    db.log_chat(user_id, "user", payload.message)
    result = chatbot_interface.get_flora_reply(payload.message, history, context=context)
    db.log_chat(user_id, "assistant", result["reply"])

    if result["flagged_for_wellbeing"]:
        db.add_notification(
            user_id,
            "Flora noticed you might be having a tough time. Take a moment to check in with yourself.",
            category="wellbeing",
        )

    return ChatResponse(**result)


@router.get("/history", response_model=List[ChatMessageOut])
def get_chat_history(current_user: dict = Depends(get_current_user)):
    """Full conversation history with Flora, oldest first — for the frontend chat window."""
    return [ChatMessageOut(**m) for m in db.list_chat(current_user["id"])]


@router.post("/analyze-pdf", response_model=PdfAnalysisResponse)
async def analyze_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload lecture notes / a textbook excerpt and get Flora's full structured
    breakdown back (Snapshot, Key Topics, Schedule, Practice Quiz) — distinct
    from /syllabus/upload, which extracts topics into the planner instead.
    """
    user_id = current_user["id"]
    file_bytes = await file.read()
    raw_text = pdf_interface.extract_raw_text(file_bytes)
    markdown = chatbot_interface.analyze_study_material(raw_text, filename=file.filename)

    db.log_chat(user_id, "user", f"[Uploaded study material: {file.filename}]")
    db.log_chat(user_id, "assistant", markdown)

    return PdfAnalysisResponse(filename=file.filename, markdown=markdown)
