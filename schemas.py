from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Syllabus / Subjects / Topics ----------
class SubjectCreate(BaseModel):
    name: str


class SubjectOut(BaseModel):
    id: str
    name: str


class TopicCreate(BaseModel):
    subject_id: str
    name: str
    exam_date: Optional[str] = None  # ISO date string, e.g. "2026-08-20"
    difficulty: int = Field(3, ge=1, le=5)


class TopicOut(BaseModel):
    id: str
    subject_id: str
    name: str
    exam_date: Optional[str]
    difficulty: int
    confidence: int
    status: str
    times_studied: int


class SyllabusUploadResponse(BaseModel):
    subjects_created: int
    topics_created: int
    topics: List[TopicOut]
    needs_review: bool = False
    parser_warnings: List[str] = []


# ---------- Daily check-in ----------
class CheckinRequest(BaseModel):
    mood: int = Field(..., ge=1, le=5, description="1=very low, 5=great")
    energy: int = Field(..., ge=1, le=5)
    available_minutes: int = Field(..., ge=0)


class CheckinResponse(BaseModel):
    id: str
    mood: int
    energy: int
    available_minutes: int
    adjusted_capacity_minutes: int
    note: str


# ---------- Study sessions ----------
class SessionCreate(BaseModel):
    topic_id: str
    duration_minutes: int = Field(..., ge=1)
    confidence_after: int = Field(..., ge=1, le=5)
    notes: str = ""


class SessionOut(BaseModel):
    id: str
    topic_id: str
    duration_minutes: int
    confidence_after: int
    timestamp: float


# ---------- Quiz / Weak zone ----------
class QuizSubmission(BaseModel):
    topic_id: str
    score_pct: float = Field(..., ge=0, le=100)
    error_tags: List[str] = Field(
        default_factory=list,
        description="e.g. ['conceptual', 'careless', 'time-pressure']",
    )


class QuizResultOut(BaseModel):
    id: str
    topic_id: str
    score_pct: float
    error_tags: List[str]


class WeakTopicOut(BaseModel):
    topic_id: str
    topic_name: Optional[str] = None
    reason: str
    severity: int


# ---------- Planner ----------
class PlanItemOut(BaseModel):
    topic_id: str
    topic_name: str
    subject_name: str
    allocated_minutes: int
    priority_score: float
    reason: str


class DailyPlanOut(BaseModel):
    generated_at: float
    total_minutes: int
    items: List[PlanItemOut]


# ---------- Exam triage ----------
class TriageResultOut(BaseModel):
    topic_id: str
    topic_name: str
    subject_name: str
    urgency_score: float
    days_to_exam: Optional[int]
    recommendation: str


# ---------- Chatbot ----------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    flagged_for_wellbeing: bool = False


class ChatMessageOut(BaseModel):
    role: str
    content: str
    timestamp: float


class PdfAnalysisResponse(BaseModel):
    filename: str
    markdown: str


# ---------- Analytics ----------
class AnalyticsSummaryOut(BaseModel):
    total_study_minutes: int
    sessions_logged: int
    avg_quiz_score: Optional[float]
    weak_topic_count: int
    topics_mastered: int
    current_streak_days: int


# ---------- Notifications ----------
class NotificationOut(BaseModel):
    id: str
    message: str
    category: str
    read: bool
    timestamp: float
