from fastapi import APIRouter, Depends

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import DailyPlanOut, PlanItemOut
from app.services import planner_engine

router = APIRouter(prefix="/planner", tags=["planner"])


@router.post("/generate", response_model=DailyPlanOut)
def generate_plan(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    topics = db.list_topics(user_id)
    weak_topics = db.list_weak_topics(user_id)
    subjects_by_id = {s["id"]: s["name"] for s in db.list_subjects(user_id)}
    checkin = db.latest_checkin(user_id)

    available_minutes = checkin["available_minutes"] if checkin else 60
    energy = checkin["energy"] if checkin else 3

    items = planner_engine.generate_daily_plan(
        topics, weak_topics, available_minutes, energy, subjects_by_id,
    )
    plan = db.save_plan(user_id, items)

    return DailyPlanOut(
        generated_at=plan["generated_at"],
        total_minutes=sum(i["allocated_minutes"] for i in items),
        items=[PlanItemOut(**i) for i in items],
    )


@router.get("/today", response_model=DailyPlanOut)
def get_today_plan(current_user: dict = Depends(get_current_user)):
    plan = db.latest_plan(current_user["id"])
    if not plan:
        return DailyPlanOut(generated_at=0, total_minutes=0, items=[])
    return DailyPlanOut(
        generated_at=plan["generated_at"],
        total_minutes=sum(i["allocated_minutes"] for i in plan["items"]),
        items=[PlanItemOut(**i) for i in plan["items"]],
    )
