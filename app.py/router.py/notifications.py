from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationOut])
def get_notifications(current_user: dict = Depends(get_current_user)):
    return [NotificationOut(**n) for n in db.list_notifications(current_user["id"])]


@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    notif = db.notifications.get(notification_id)
    if not notif or notif["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif["read"] = True
    return NotificationOut(**notif)
