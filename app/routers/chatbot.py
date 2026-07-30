from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import ChatRequest, ChatResponse
from app.services import chatbot_interface

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


@router.post("/ask", response_model=ChatResponse)
def ask_flora(payload: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    history = db.list_chat(user_id)

    db.log_chat(user_id, "user", payload.message)
    result = chatbot_interface.get_flora_reply(payload.message, history)
    db.log_chat(user_id, "assistant", result["reply"])

    if result["flagged_for_wellbeing"]:
        db.add_notification(
            user_id,
            "Flora noticed you might be having a tough time. Take a moment to check in with yourself.",
            category="wellbeing",
        )

    return ChatResponse(**result)
