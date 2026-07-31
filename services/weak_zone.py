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


# ==========================================================
# CONFIDENCE MATRIX — new feature
#
# Compares what a student BELIEVES about a topic (confidence, 1-5,
# self-reported) against what quiz results say is TRUE (score_pct).
# Places the topic into one of 4 quadrants. "danger_zone" is the
# headline case: student feels sure, but the data disagrees — the
# exact pattern that blindsides people on real exams.
#
# This does not replace analyse_topic_performance() above — it's an
# additional, independent signal computed from the same quiz data.
# ==========================================================

def confidence_matrix_position(confidence: int, score_pct: float) -> dict:
    """
    confidence: 1-5 (student's self-rating, from TopicOut.confidence)
    score_pct: 0-100 (actual quiz performance, from QuizSubmission.score_pct)
    """
    expected_score = confidence * 20  # scale 1-5 -> 20-100
    gap = round(expected_score - score_pct, 1)
    feels_confident = confidence >= 4
    actually_strong = score_pct >= 65

    if feels_confident and not actually_strong:
        quadrant = "danger_zone"
        message = (
            "You feel sure about this — but your scores say otherwise. "
            "This is exactly the kind of topic that blindsides people on exam day."
        )
    elif not feels_confident and actually_strong:
        quadrant = "hidden_strength"
        message = "You're doing better here than you think. Trust yourself more on this one."
    elif feels_confident and actually_strong:
        quadrant = "well_calibrated"
        message = "Your confidence matches your performance — good self-awareness here."
    else:
        quadrant = "correctly_flagged"
        message = "You know this needs work, and the data agrees. Keep it in rotation."

    return {"quadrant": quadrant, "gap": gap, "message": message}
