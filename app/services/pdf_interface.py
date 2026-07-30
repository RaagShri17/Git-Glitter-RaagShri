"""
Syllabus PDF Parser — interface contract for Person 4 (Chatbot / PDF parsing).

Person 4: implement `parse_syllabus_pdf` to extract real topics from an
uploaded PDF (e.g. pdfplumber / PyMuPDF + regex, or an LLM extraction call).
Return a list of dicts shaped like:
    {"subject_name": str, "topic_name": str,
     "exam_date": Optional[str] (ISO date, e.g. "2026-08-20"),
     "estimated_difficulty": int (1-5)}

The stub below returns fake topics so /syllabus/upload and the rest of the
pipeline (planner, triage, weak zones) are fully testable before the real
parser is ready. Keep the same function signature — routers/syllabus.py
doesn't need to change when you swap this in.
"""
from typing import List


def parse_syllabus_pdf(file_bytes: bytes, filename: str) -> List[dict]:
    return [
        {"subject_name": "Sample Subject", "topic_name": "Sample Topic 1",
         "exam_date": None, "estimated_difficulty": 3},
        {"subject_name": "Sample Subject", "topic_name": "Sample Topic 2",
         "exam_date": None, "estimated_difficulty": 4},
    ]
