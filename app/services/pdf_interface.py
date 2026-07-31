"""
Syllabus PDF Parser — real implementation for Person 4 (Chatbot / PDF parsing).

Pipeline:
    1. extract_raw_text()  — pull raw text out of the PDF with pypdf.
    2. clean_text()         — repair hyphen line-breaks, strip page noise
                               (headers/footers/page numbers), matching
                               Flora's text-cleaning rules.
    3. parse_syllabus_pdf() — ask Claude to extract structured subjects/
                               topics/exam dates as JSON. Falls back to a
                               heading + date-regex heuristic if no
                               ANTHROPIC_API_KEY is configured or the LLM
                               call/parse fails, and to the original sample
                               topics if the PDF has no extractable text at
                               all — so /syllabus/upload always returns
                               something usable for the demo.

Keep `parse_syllabus_pdf`'s name/signature and return shape identical:
    {"subject_name": str, "topic_name": str,
     "exam_date": Optional[str] (ISO date, e.g. "2026-08-20"),
     "estimated_difficulty": int (1-5)}
routers/syllabus.py doesn't need to change.
"""
import io
import json
import re
from typing import List, Optional

from app.services import llm_client

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover - only hit if the package isn't installed
    PdfReader = None


# ---------------------------------------------------------------------------
# 1. Raw text extraction
# ---------------------------------------------------------------------------
def extract_raw_text(file_bytes: bytes) -> str:
    """Pull raw text out of a PDF's pages, best-effort. Returns '' on failure."""
    if PdfReader is None:
        print("[pdf_interface] pypdf is not installed — add it to requirements.txt")
        return ""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:  # noqa: BLE001
        print(f"[pdf_interface] Failed to read PDF: {exc}")
        return ""


# ---------------------------------------------------------------------------
# 2. Text cleaning (Flora's Section 3 rules)
# ---------------------------------------------------------------------------
_HYPHEN_BREAK = re.compile(r"(\w+)-\n(\w+)")
_PAGE_NUMBER_LINE = re.compile(r"^\s*(page\s*)?\d{1,4}\s*(/\s*\d{1,4})?\s*$", re.IGNORECASE)
_COPYRIGHT_LINE = re.compile(r"^\s*(©|copyright)\b", re.IGNORECASE)
_MULTI_BLANK = re.compile(r"\n{3,}")


def clean_text(raw: str) -> str:
    """Rejoin hyphen-split words and drop obvious header/footer/page-number noise."""
    text = _HYPHEN_BREAK.sub(r"\1\2", raw)
    lines = [
        ln for ln in text.split("\n")
        if not _PAGE_NUMBER_LINE.match(ln) and not _COPYRIGHT_LINE.match(ln)
    ]
    text = "\n".join(lines)
    return _MULTI_BLANK.sub("\n\n", text).strip()


# ---------------------------------------------------------------------------
# 3a. LLM-based structured extraction (preferred path)
# ---------------------------------------------------------------------------
_EXTRACTION_SYSTEM_PROMPT = """\
You are Flora's syllabus-parsing engine for the Studiora app. You will be \
given cleaned text extracted from a student's uploaded syllabus, lecture \
notes, or textbook excerpt.

Extract every distinct subject and topic you can confidently identify, plus \
any exam dates or assignment deadlines you can resolve to an ISO date \
(YYYY-MM-DD). If a document only covers one subject, use its title or a \
sensible name as subject_name for every topic.

Respond with ONLY a JSON array (no prose, no markdown code fences). Each \
element must have exactly these keys:
{"subject_name": string, "topic_name": string, "exam_date": string or null, \
"estimated_difficulty": integer from 1 (easiest) to 5 (hardest, your best \
estimate based on how the material is described)}
"""

_CODE_FENCE = re.compile(r"^```(?:json)?|```$", re.MULTILINE)


def _llm_extract(text: str, filename: str) -> Optional[List[dict]]:
    user_prompt = (
        f"Filename: {filename}\n\nCleaned syllabus/notes text:\n---\n{text[:15000]}\n---\n\n"
        "Return ONLY the JSON array described in your instructions."
    )
    raw_reply = llm_client.call_claude(
        system=_EXTRACTION_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
        max_tokens=2048,
    )
    if raw_reply is None:
        return None

    cleaned = _CODE_FENCE.sub("", raw_reply).strip()
    try:
        data = json.loads(cleaned)
        if not isinstance(data, list) or not data:
            return None
        topics = []
        for item in data:
            if not isinstance(item, dict):
                continue
            try:
                difficulty = int(item.get("estimated_difficulty") or 3)
            except (TypeError, ValueError):
                difficulty = 3
            topics.append({
                "subject_name": str(item.get("subject_name") or "General")[:120],
                "topic_name": str(item.get("topic_name") or "Untitled Topic")[:200],
                "exam_date": item.get("exam_date") or None,
                "estimated_difficulty": max(1, min(5, difficulty)),
            })
        return topics or None
    except (json.JSONDecodeError, TypeError) as exc:
        print(f"[pdf_interface] Could not parse LLM JSON response: {exc}")
        return None


# ---------------------------------------------------------------------------
# 3b. Heuristic fallback (no API key / LLM call failed)
# ---------------------------------------------------------------------------
_HEADING_LINE = re.compile(
    r"^\s*(unit|chapter|module|week|topic|lecture)\s*[\d.\-]*[:.\-]?\s*(.+)$",
    re.IGNORECASE,
)
_ISO_DATE = re.compile(r"\b(\d{4})-(\d{2})-(\d{2})\b")
_SLASH_DATE = re.compile(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b")


def _find_date_in_line(line: str) -> Optional[str]:
    iso_match = _ISO_DATE.search(line)
    if iso_match:
        return f"{iso_match.group(1)}-{iso_match.group(2)}-{iso_match.group(3)}"
    slash_match = _SLASH_DATE.search(line)
    if slash_match:
        day, month, year = slash_match.groups()
        return f"{year}-{int(month):02d}-{int(day):02d}"
    return None


_LOOKAHEAD_LINES = 3  # how many lines after a heading to scan for its exam date


def _heuristic_extract(text: str) -> List[dict]:
    lines = text.split("\n")
    topics = []
    for i, line in enumerate(lines):
        match = _HEADING_LINE.match(line)
        if not match:
            continue
        name = match.group(2).strip(" :-\u2013\u2014")
        if not name:
            continue

        exam_date = _find_date_in_line(line)
        if not exam_date:
            # Exam/deadline dates are often on their own line right after the
            # heading (e.g. "Unit 1: ...\nExam Date: 2026-08-15") rather than
            # on the heading line itself — scan forward until the next heading.
            for lookahead in lines[i + 1:i + 1 + _LOOKAHEAD_LINES]:
                if _HEADING_LINE.match(lookahead):
                    break
                exam_date = _find_date_in_line(lookahead)
                if exam_date:
                    break

        topics.append({
            "subject_name": "General",
            "topic_name": name[:200],
            "exam_date": exam_date,
            "estimated_difficulty": 3,
        })
    return topics


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------
_SAMPLE_TOPICS = [
    {"subject_name": "Sample Subject", "topic_name": "Sample Topic 1",
     "exam_date": None, "estimated_difficulty": 3},
    {"subject_name": "Sample Subject", "topic_name": "Sample Topic 2",
     "exam_date": None, "estimated_difficulty": 4},
]


def parse_syllabus_pdf(file_bytes: bytes, filename: str) -> List[dict]:
    raw_text = extract_raw_text(file_bytes)
    if not raw_text.strip():
        # Couldn't extract anything (scanned/image-only PDF, bad file, etc.)
        # — keep the pipeline demoable with the original sample topics.
        return _SAMPLE_TOPICS

    text = clean_text(raw_text)

    topics = _llm_extract(text, filename)
    if topics:
        return topics

    topics = _heuristic_extract(text)
    if topics:
        return topics

    return [{
        "subject_name": "General",
        "topic_name": f"{filename} (auto-extraction found no clear headings — please add topics manually)",
        "exam_date": None,
        "estimated_difficulty": 3,
    }]
