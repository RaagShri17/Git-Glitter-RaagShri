"""
Weak Zone Detection — default rule-based implementation.

INTEGRATION NOTE FOR PERSON 3 (AI/ML):
This uses simple score thresholds + error-tag frequency, matching the
Feasibility doc's "simple performance thresholds" heuristic. To upgrade to
a real model, replace `analyse_topic_performance` — keep the return shape
{"is_weak": bool, "reason": str, "severity": int (1-5)} so quiz.py doesn't
need to change.
"""
from collections import Counter

WEAK_SCORE_THRESHOLD = 60.0


def analyse_topic_performance(quiz_results: list) -> dict:
    """quiz_results: dicts with score_pct + error_tags, all for one topic."""
    if not quiz_results:
        return {"is_weak": False, "reason": "", "severity": 0}

    avg_score = sum(r["score_pct"] for r in quiz_results) / len(quiz_results)
    all_tags = [tag for r in quiz_results for tag in r.get("error_tags", [])]
    tag_counts = Counter(all_tags)
    dominant_tag, dominant_count = (tag_counts.most_common(1) or [(None, 0)])[0]

    if avg_score >= WEAK_SCORE_THRESHOLD and dominant_count < 2:
        return {"is_weak": False, "reason": "", "severity": 0}

    if avg_score < 40:
        severity = 5
    elif avg_score < 55:
        severity = 4
    elif avg_score < 60:
        severity = 3
    else:
        severity = 2

    if dominant_tag:
        reason = f"Recurring '{dominant_tag}' mistakes ({dominant_count}x), avg score {avg_score:.0f}%"
    else:
        reason = f"Low average score ({avg_score:.0f}%)"

    return {"is_weak": True, "reason": reason, "severity": severity}
