from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import CheckinRequest, CheckinResponse
from app.services.planner_engine import ENERGY_FACTOR

router = APIRouter(prefix="/checkin", tags=["checkin"])


@router.post("", response_model=CheckinResponse)
def daily_checkin(payload: CheckinRequest, current_user: dict = Depends(get_current_user)):
    checkin = db.add_checkin(current_user["id"], payload.mood, payload.energy, payload.available_minutes)
    adjusted = int(payload.available_minutes * ENERGY_FACTOR.get(payload.energy, 1.0))

    if payload.mood <= 2:
        note = "Low mood today — plan will lean towards lighter, more familiar topics."
    elif payload.energy <= 2:
        note = "Low energy — plan will shorten study blocks and prioritize review over new material."
    else:
        note = "Good to go — plan will target your highest-priority topics."

    return CheckinResponse(
        id=checkin["id"], mood=payload.mood, energy=payload.energy,
        available_minutes=payload.available_minutes,
        adjusted_capacity_minutes=adjusted, note=note,
    )


@router.get("/latest", response_model=CheckinResponse)
def get_latest_checkin(current_user: dict = Depends(get_current_user)):
    checkin = db.latest_checkin(current_user["id"])
    if not checkin:
        return CheckinResponse(
            id="", mood=3, energy=3, available_minutes=0,
            adjusted_capacity_minutes=0, note="No check-in yet today.",
        )
    adjusted = int(checkin["available_minutes"] * ENERGY_FACTOR.get(checkin["energy"], 1.0))
    return CheckinResponse(
        id=checkin["id"], mood=checkin["mood"], energy=checkin["energy"],
        available_minutes=checkin["available_minutes"],
        adjusted_capacity_minutes=adjusted, note="",
    )
