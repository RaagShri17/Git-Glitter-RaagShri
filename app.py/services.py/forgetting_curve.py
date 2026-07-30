"""
Forgetting Curve Engine — default rule-based implementation.

INTEGRATION NOTE FOR PERSON 3 (AI/ML):
This currently uses a simple Ebbinghaus-style spaced-repetition formula,
matching the "heuristic-first" approach from the Feasibility doc. To
upgrade to a trained model, replace `predict_retention` and
`next_review_due` below — keep the function signatures the same and every
router/service that imports this module (e.g. planner_engine) keeps
working unchanged.
"""
import math
import time

# Rough memory-strength constant in days, keyed by self-reported confidence.
# Higher confidence -> slower decay -> longer until review is due.
BASE_STRENGTH_DAYS = {1: 1, 2: 2, 3: 4, 4: 7, 5: 12}


def predict_retention(confidence: int, days_since_studied: float) -> float:
    """Estimated retention probability (0-1) via exponential decay."""
    strength = BASE_STRENGTH_DAYS.get(confidence, 3)
    return math.exp(-days_since_studied / strength)


def next_review_due(topic: dict, retention_threshold: float = 0.65) -> float:
    """Unix timestamp for when retention is predicted to drop below
    `retention_threshold`, i.e. when this topic should be reviewed again."""
    confidence = topic.get("confidence", 3)
    strength = BASE_STRENGTH_DAYS.get(confidence, 3)
    last_studied = topic.get("last_studied_at") or time.time()
    days_until_due = -strength * math.log(retention_threshold)
    return last_studied + days_until_due * 86400


def topics_due_for_review(topics: list, now: float = None) -> list:
    """Topics whose predicted retention has already dropped below threshold."""
    now = now or time.time()
    due = []
    for t in topics:
        if not t.get("last_studied_at"):
            continue
        if next_review_due(t) <= now:
            due.append(t)
    return due
