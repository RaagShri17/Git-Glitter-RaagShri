"""
In-memory data store — placeholder for Person 2's database layer.

INTEGRATION NOTE FOR PERSON 2 (Database & Auth):
Replace the internals of this class with real Firebase Firestore / MongoDB
calls, but keep the method names and signatures identical. Every router and
service in this backend talks to the database ONLY through `db` (the
singleton at the bottom of this file), so swapping the storage engine here
means nobody else's code has to change.

Run the app as-is (no DB setup needed) to demo the full flow today; swap
this file whenever the real database is ready.
"""
import itertools
import time
from typing import Optional

_counter = itertools.count()


def _new_id(prefix: str) -> str:
    return f"{prefix}_{int(time.time() * 1000)}_{next(_counter)}"


class DataStore:
    def __init__(self):
        self.users = {}          # user_id -> user dict
        self.subjects = {}       # subject_id -> subject dict
        self.topics = {}         # topic_id -> topic dict
        self.sessions = {}       # session_id -> study session dict
        self.quiz_results = {}   # quiz_id -> result dict
        self.weak_topics = {}    # weak_topic_id -> dict
        self.checkins = {}       # checkin_id -> dict
        self.plans = {}          # plan_id -> dict
        self.notifications = {}  # notif_id -> dict
        self.chat_logs = {}      # message_id -> dict

    # ---------- Users ----------
    def create_user(self, email: str, name: str, hashed_password: str) -> dict:
        user_id = _new_id("user")
        user = {
            "id": user_id, "email": email, "name": name,
            "hashed_password": hashed_password, "created_at": time.time(),
        }
        self.users[user_id] = user
        return user

    def get_user_by_email(self, email: str) -> Optional[dict]:
        return next((u for u in self.users.values() if u["email"] == email), None)

    def get_user(self, user_id: str) -> Optional[dict]:
        return self.users.get(user_id)

    # ---------- Subjects & Topics ----------
    def add_subject(self, user_id: str, name: str) -> dict:
        subject_id = _new_id("subj")
        subject = {"id": subject_id, "user_id": user_id, "name": name}
        self.subjects[subject_id] = subject
        return subject

    def list_subjects(self, user_id: str):
        return [s for s in self.subjects.values() if s["user_id"] == user_id]

    def add_topic(self, user_id: str, subject_id: str, name: str,
                   exam_date: Optional[str] = None, difficulty: int = 3) -> dict:
        topic_id = _new_id("topic")
        topic = {
            "id": topic_id, "user_id": user_id, "subject_id": subject_id,
            "name": name, "exam_date": exam_date, "difficulty": difficulty,
            "confidence": 3, "status": "not_started",
            "last_studied_at": None, "times_studied": 0,
        }
        self.topics[topic_id] = topic
        return topic

    def list_topics(self, user_id: str, subject_id: Optional[str] = None):
        topics = [t for t in self.topics.values() if t["user_id"] == user_id]
        if subject_id:
            topics = [t for t in topics if t["subject_id"] == subject_id]
        return topics

    def get_topic(self, topic_id: str) -> Optional[dict]:
        return self.topics.get(topic_id)

    def update_topic(self, topic_id: str, **fields) -> Optional[dict]:
        topic = self.topics.get(topic_id)
        if topic:
            topic.update(fields)
        return topic

    # ---------- Study sessions ----------
    def log_session(self, user_id: str, topic_id: str, duration_minutes: int,
                     confidence_after: int, notes: str = "") -> dict:
        session_id = _new_id("sess")
        session = {
            "id": session_id, "user_id": user_id, "topic_id": topic_id,
            "duration_minutes": duration_minutes, "confidence_after": confidence_after,
            "notes": notes, "timestamp": time.time(),
        }
        self.sessions[session_id] = session
        topic = self.topics.get(topic_id)
        if topic:
            topic["times_studied"] += 1
            topic["last_studied_at"] = session["timestamp"]
            topic["confidence"] = confidence_after
            topic["status"] = "in_progress"
        return session

    def list_sessions(self, user_id: str):
        return [s for s in self.sessions.values() if s["user_id"] == user_id]

    # ---------- Quiz results ----------
    def add_quiz_result(self, user_id: str, topic_id: str, score_pct: float,
                         error_tags: list) -> dict:
        quiz_id = _new_id("quiz")
        result = {
            "id": quiz_id, "user_id": user_id, "topic_id": topic_id,
            "score_pct": score_pct, "error_tags": error_tags, "timestamp": time.time(),
        }
        self.quiz_results[quiz_id] = result
        return result

    def list_quiz_results(self, user_id: str, topic_id: Optional[str] = None):
        results = [r for r in self.quiz_results.values() if r["user_id"] == user_id]
        if topic_id:
            results = [r for r in results if r["topic_id"] == topic_id]
        return results

    # ---------- Weak topics ----------
    def upsert_weak_topic(self, user_id: str, topic_id: str, reason: str, severity: int) -> dict:
        existing = next(
            (w for w in self.weak_topics.values()
             if w["user_id"] == user_id and w["topic_id"] == topic_id), None,
        )
        if existing:
            existing.update({"reason": reason, "severity": severity, "updated_at": time.time()})
            return existing
        weak_id = _new_id("weak")
        weak = {
            "id": weak_id, "user_id": user_id, "topic_id": topic_id,
            "reason": reason, "severity": severity, "updated_at": time.time(),
        }
        self.weak_topics[weak_id] = weak
        return weak

    def list_weak_topics(self, user_id: str):
        return [w for w in self.weak_topics.values() if w["user_id"] == user_id]

    # ---------- Check-ins ----------
    def add_checkin(self, user_id: str, mood: int, energy: int, available_minutes: int) -> dict:
        checkin_id = _new_id("chk")
        checkin = {
            "id": checkin_id, "user_id": user_id, "mood": mood, "energy": energy,
            "available_minutes": available_minutes, "timestamp": time.time(),
        }
        self.checkins[checkin_id] = checkin
        return checkin

    def latest_checkin(self, user_id: str) -> Optional[dict]:
        user_checkins = [c for c in self.checkins.values() if c["user_id"] == user_id]
        return max(user_checkins, key=lambda c: c["timestamp"]) if user_checkins else None

    # ---------- Plans ----------
    def save_plan(self, user_id: str, plan_items: list) -> dict:
        plan_id = _new_id("plan")
        plan = {"id": plan_id, "user_id": user_id, "items": plan_items, "generated_at": time.time()}
        self.plans[plan_id] = plan
        return plan

    def latest_plan(self, user_id: str) -> Optional[dict]:
        user_plans = [p for p in self.plans.values() if p["user_id"] == user_id]
        return max(user_plans, key=lambda p: p["generated_at"]) if user_plans else None

    # ---------- Notifications ----------
    def add_notification(self, user_id: str, message: str, category: str = "info") -> dict:
        notif_id = _new_id("notif")
        notif = {
            "id": notif_id, "user_id": user_id, "message": message,
            "category": category, "read": False, "timestamp": time.time(),
        }
        self.notifications[notif_id] = notif
        return notif

    def list_notifications(self, user_id: str):
        items = [n for n in self.notifications.values() if n["user_id"] == user_id]
        return sorted(items, key=lambda n: n["timestamp"], reverse=True)

    # ---------- Chat logs ----------
    def log_chat(self, user_id: str, role: str, content: str) -> dict:
        msg_id = _new_id("msg")
        msg = {
            "id": msg_id, "user_id": user_id, "role": role, "content": content,
            "timestamp": time.time(),
        }
        self.chat_logs[msg_id] = msg
        return msg

    def list_chat(self, user_id: str):
        items = [m for m in self.chat_logs.values() if m["user_id"] == user_id]
        return sorted(items, key=lambda m: m["timestamp"])


# Singleton instance used across the whole app.
db = DataStore()
