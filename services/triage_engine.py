"""
Exam Triage Engine — rule-based topic priority when deadlines clash.

Ranks topics by urgency = f(days to exam, difficulty, confidence), so when
two exams overlap the student gets a clear "study this first" ordering
instead of panic-studying whichever exam feels scariest (pain point #4 in
the Problem doc: "Deadline Chaos").
"""
from datetime import datetime, timezone


def _days_left(exam_date: str):
    if not exam_date:
        return None
    try:
        exam_dt = datetime.fromisoformat(exam_date).replace(tzinfo=timezone.utc)
    except ValueError:
        return None
    return max((exam_dt - datetime.now(timezone.utc)).days, 0)


def triage_topics(topics: list, subjects_by_id: dict) -> list:
    results = []
    for t in topics:
        days_left = _days_left(t.get("exam_date"))
        if days_left is None:
            continue  # no exam date -> nothing to triage against

        difficulty = t.get("difficulty", 3)
        confidence = t.get("confidence", 3)
        urgency = round((difficulty * (6 - confidence)) / (days_left + 1), 3)

        if days_left <= 2 and confidence <= 2:
            recommendation = "Critical — prioritize immediately, consider triaging time away from other subjects"
        elif days_left <= 5:
            recommendation = "High priority — schedule focused blocks this week"
        elif confidence <= 2:
            recommendation = "Needs attention — low confidence, but time remains"
        else:
            recommendation = "On track — maintain light review"

        results.append({
            "topic_id": t["id"],
            "topic_name": t["name"],
            "subject_name": subjects_by_id.get(t["subject_id"], "Unknown"),
            "urgency_score": urgency,
            "days_to_exam": days_left,
            "recommendation": recommendation,
        })

    results.sort(key=lambda r: r["urgency_score"], reverse=True)
    return results
