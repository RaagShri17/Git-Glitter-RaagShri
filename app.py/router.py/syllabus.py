from typing import List, Optional

from fastapi import APIRouter, Depends, File, UploadFile

from app.db.store import db
from app.dependencies import get_current_user
from app.models.schemas import (
    SubjectCreate, SubjectOut, SyllabusUploadResponse, TopicCreate, TopicOut,
)
from app.services import pdf_interface

router = APIRouter(prefix="/syllabus", tags=["syllabus"])


@router.post("/upload", response_model=SyllabusUploadResponse)
async def upload_syllabus(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    file_bytes = await file.read()
    parsed = pdf_interface.parse_syllabus_pdf(file_bytes, file.filename)

    subject_ids_by_name = {}
    topics_created = []
    for item in parsed:
        subj_name = item["subject_name"]
        if subj_name not in subject_ids_by_name:
            existing = next(
                (s for s in db.list_subjects(current_user["id"]) if s["name"] == subj_name), None,
            )
            subject = existing or db.add_subject(current_user["id"], subj_name)
            subject_ids_by_name[subj_name] = subject["id"]

        topic = db.add_topic(
            current_user["id"], subject_ids_by_name[subj_name], item["topic_name"],
            exam_date=item.get("exam_date"), difficulty=item.get("estimated_difficulty", 3),
        )
        topics_created.append(topic)

    return SyllabusUploadResponse(
        subjects_created=len(subject_ids_by_name),
        topics_created=len(topics_created),
        topics=[TopicOut(**t) for t in topics_created],
        needs_review=True,
        parser_warnings=["Auto-extracted topics — please review before generating your plan."],
    )


@router.post("/subjects", response_model=SubjectOut)
def create_subject(payload: SubjectCreate, current_user: dict = Depends(get_current_user)):
    subject = db.add_subject(current_user["id"], payload.name)
    return SubjectOut(**subject)


@router.get("/subjects", response_model=List[SubjectOut])
def get_subjects(current_user: dict = Depends(get_current_user)):
    return [SubjectOut(**s) for s in db.list_subjects(current_user["id"])]


@router.post("/topics", response_model=TopicOut)
def create_topic(payload: TopicCreate, current_user: dict = Depends(get_current_user)):
    topic = db.add_topic(
        current_user["id"], payload.subject_id, payload.name,
        payload.exam_date, payload.difficulty,
    )
    return TopicOut(**topic)


@router.get("/topics", response_model=List[TopicOut])
def get_topics(subject_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    return [TopicOut(**t) for t in db.list_topics(current_user["id"], subject_id)]
