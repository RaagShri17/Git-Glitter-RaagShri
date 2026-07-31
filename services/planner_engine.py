"""
Planner Engine — rule-based smart scheduling (backend-owned business logic).

Combines exam urgency, difficulty, confidence (a weak-zone signal), and the
forgetting curve to build today's study plan, then fits it into the minutes
the student reported as available in their daily check-in. This is the
piece that turns "Input -> Parse -> Check-in" into "Plan" in the product's
data-flow diagram.
"""
from datetime import datetime, timezone

from app.services import forgetting_curve

ENERGY_FACTOR = {1: 0.6, 2: 0.8, 3: 1.0, 4: 1.15, 5: 1.3}


def _days_to_exam(exam_date: str) -> float:
    if not exam_date:
        return 999
    try:
        exam_dt = datetime.fromisoformat(exam_date).replace(tzinfo=timezone.utc)
    except ValueError:
        return 999
    delta = exam_dt - datetime.now(timezone.utc)
    return max(delta.days, 0)


def _priority_score(topic: dict, weak_ids: set, due_ids: set) -> float:
    days_left = _days_to_exam(topic.get("exam_date"))
    urgency = 1 / (days_left + 1)
    difficulty_weight = topic.get("difficulty", 3) / 5
    confidence_gap = (6 - topic.get("confidence", 3)) / 5
    weak_bonus = 0.4 if topic["id"] in weak_ids else 0
    due_bonus = 0.3 if topic["id"] in due_ids else 0
    return round(urgency * 2 + difficulty_weight + confidence_gap + weak_bonus + due_bonus, 3)


def generate_daily_plan(topics: list, weak_topics: list, available_minutes: int,
                         energy: int = 3, subjects_by_id: dict = None) -> list:
    subjects_by_id = subjects_by_id or {}
    weak_ids = {w["topic_id"] for w in weak_topics}
    due_ids = {t["id"] for t in forgetting_curve.topics_due_for_review(topics)}

    scored = [
        {"topic": t, "score": _priority_score(t, weak_ids, due_ids)}
        for t in topics if t.get("status") != "mastered"
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)

    # Low energy -> shorter effective session; high energy -> can push further.
    usable_minutes = int(available_minutes * ENERGY_FACTOR.get(energy, 1.0))

    plan_items, remaining = [], usable_minutes
    for entry in scored:
        if remaining <= 0:
            break
        topic = entry["topic"]
        block = min(45, max(20, remaining))
        block = min(block, remaining)
        if block < 10:
            break

        reason_bits = []
        if topic["id"] in weak_ids:
            reason_bits.append("flagged weak zone")
        if topic["id"] in due_ids:
            reason_bits.append("forgetting curve says review now")
        if not reason_bits:
            reason_bits.append("upcoming exam priority")

        plan_items.append({
            "topic_id": topic["id"],
            "topic_name": topic["name"],
            "subject_name": subjects_by_id.get(topic["subject_id"], "Unknown"),
            "allocated_minutes": block,
            "priority_score": entry["score"],
            "reason": ", ".join(reason_bits),
        })
        remaining -= block

    return plan_items
