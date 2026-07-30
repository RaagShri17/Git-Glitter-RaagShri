"""
AI Recommendation Engine — interface contract for Person 3 (AI/ML).

Person 3: implement `recommend_next_topics` for real personalized
suggestions (e.g. scikit-learn model trained on session/quiz history).
Until then, this default falls back to plain rule-based ranking (weak
topics first, then hardest) so the API works end-to-end for the demo.
Keep the function signature the same so routers don't need to change.
"""
from typing import List


def recommend_next_topics(topics: List[dict], weak_topics: List[dict], top_n: int = 5) -> List[dict]:
    weak_ids = {w["topic_id"] for w in weak_topics}
    ranked = sorted(
        topics,
        key=lambda t: (t["id"] not in weak_ids, -t.get("difficulty", 3)),
    )
    return ranked[:top_n]
