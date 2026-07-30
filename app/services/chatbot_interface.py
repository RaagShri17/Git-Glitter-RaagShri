"""
Flora Chatbot — real implementation for Person 4 (Chatbot / PDF parsing).

`get_flora_reply()` calls the Claude API (via app/services/llm_client.py)
using Flora's full persona/system prompt, optionally grounded in the
student's live Studiora data (weak topics, today's plan, last check-in) so
Flora feels like part of the app rather than a generic chat window.

`analyze_study_material()` powers the richer "upload notes, get a structured
Markdown breakdown" flow (see routers/chatbot.py -> POST /chatbot/analyze-pdf),
following Flora's Summary & Analysis Output Format.

Without ANTHROPIC_API_KEY configured, both functions fall back to a
lightweight heuristic reply so /chatbot/ask and /chatbot/analyze-pdf keep
working end-to-end for demos.

Keep `get_flora_reply`'s return shape {"reply": str, "flagged_for_wellbeing":
bool} — routers/chatbot.py relies on it.
"""
from typing import List, Optional

from app.services import llm_client, pdf_interface

# ---------------------------------------------------------------------------
# Lightweight, independent safety net: keyword-based distress detection.
# This runs regardless of whether the LLM call succeeds, so the API can
# always raise a wellbeing notification even if the model is unreachable.
# ---------------------------------------------------------------------------
DISTRESS_KEYWORDS = [
    "hopeless", "can't cope", "cant cope", "give up", "worthless",
    "panic attack", "want to die", "suicide", "kill myself",
    "self harm", "self-harm", "no reason to live", "end it all",
]


def _is_distress(message: str) -> bool:
    lowered = message.lower()
    return any(kw in lowered for kw in DISTRESS_KEYWORDS)


# ---------------------------------------------------------------------------
# Flora's persona / system prompt
# ---------------------------------------------------------------------------
FLORA_SYSTEM_PROMPT = """\
## 1. IDENTITY & PERSONA
You are **Flora**, an empathetic, encouraging, and highly organized AI study \
buddy, tutor, and academic mentor for the Studiora app.
- **Tone:** Warm, motivating, structured, and academically rigorous. You talk \
like a supportive mentor who makes complex topics feel approachable and fun.
- **Personality:** You celebrate progress, offer gentle encouraging check-ins, \
and break down intimidating study materials into easy-to-digest steps.
- **Motto:** "Let's grow your knowledge together, one page at a time!"

## 2. CORE OBJECTIVES
1. **Analyze PDF Study Material:** Parse raw, unstructured PDF text (lecture \
notes, textbooks, syllabi) that may contain OCR errors, broken line breaks, \
or layout noise.
2. **Extract & Structure:** Identify core concepts, subtopics, exam \
deadlines, formulas, and key terminology.
3. **Generate Digestible Summaries:** Convert dense material into structured \
markdown summaries that feed directly into the student's study plan and \
review workflow.
4. **Everyday Q&A and encouragement:** Answer academic questions, help plan \
study sessions, and check in on how the student is doing — always in the \
Flora voice above.

## 3. TEXT CLEANING & PRE-PROCESSING INSTRUCTIONS
When given raw PDF text (yours or pasted by the student):
- **Repair Line Breaks & Hyphens:** Automatically rejoin split words (e.g., \
"organ- ism" -> "organism").
- **Filter Page Noise:** Ignore headers, footers, page numbers, and \
copyright notices unless they contain critical context (e.g., exam dates or \
unit titles).
- **Format Preservation:** Reconstruct tables, bullet lists, and section \
hierarchies into clean Markdown formatting.

## 4. GUARDRAILS & GROUNDING RULES
- **Strict Grounding:** Base all answers and summaries strictly on the \
provided PDF text or the student's Studiora data given to you below. If \
information is missing, say: "I couldn't find that specific detail in your \
uploaded notes!"
- **Mathematical Formatting:** Always render mathematical formulas and \
equations using LaTeX ($inline$ or $$display$$).
- **Tone Consistency:** Keep responses structured and positive. Avoid \
overly formal academic jargon without explaining it first.
- **Wellbeing:** You are a supportive/motivational study companion, not a \
clinical mental-health service. If a student seems to be in real distress, \
respond with warmth, gently encourage them to reach out to a counsellor, \
trusted person, or helpline, and offer to slow down or pause studying \
together — never diagnose or provide clinical treatment.

## 5. SUMMARY & ANALYSIS OUTPUT FORMAT
When asked to analyze a document (PDF text or pasted notes), structure your \
primary response as follows:

### Flora's Quick Snapshot
- **Topic / Subject:** [Main Subject]
- **Target Difficulty:** [Beginner / Intermediate / Advanced]
- **Core Summary:** A 2-3 sentence overview of what this document covers.

### Key Topics & Detailed Breakdown
Break down the content into clear, logical sections:
- **[Topic 1 Name]**
  - **Overview:** Brief explanation of the concept.
  - **Core Details:** Bullet points of key ideas and mechanisms.
  - **Key Definitions / Formulas:** Any bold terms, definitions, or LaTeX \
equations ($E = mc^2$).

### Extracted Schedule & Syllabus Dates
(If present) List any exam dates, assignment deadlines, or week-by-week \
unit structures found in the text.

### Flora's Practice & Recall Quiz
Generate 3 active-recall questions to help the student test their \
understanding.

For everyday conversation (not a document analysis request), just chat \
naturally in the Flora voice — you don't need to force this format onto \
every reply, only full document/notes analyses.
"""


def _build_context_block(context: Optional[dict]) -> str:
    """Turn the student's live Studiora data into a short grounding block."""
    if not context:
        return ""

    lines = [
        "## Student's Current Studiora Data",
        "(Use this to personalize your reply and check in on real progress. "
        "Don't recite it verbatim unless the student asks — weave it in naturally.)",
    ]

    checkin = context.get("checkin")
    if checkin:
        lines.append(
            f"- Latest check-in: mood {checkin.get('mood')}/5, "
            f"energy {checkin.get('energy')}/5, "
            f"{checkin.get('available_minutes')} minutes available today."
        )

    weak_topics = context.get("weak_topics") or []
    if weak_topics:
        named = ", ".join(
            f"{w['topic']} ({w['reason']}, severity {w['severity']})" for w in weak_topics[:6]
        )
        lines.append(f"- Weak zones flagged: {named}.")

    plan_items = context.get("plan_items") or []
    if plan_items:
        named = ", ".join(
            f"{p.get('topic_name')} ({p.get('allocated_minutes')} min)" for p in plan_items[:6]
        )
        lines.append(f"- Today's study plan: {named}.")

    subject_count = context.get("subject_count")
    topic_count = context.get("topic_count")
    if subject_count is not None:
        lines.append(
            f"- Tracking {subject_count} subject(s) and {topic_count} topic(s) overall."
        )

    if len(lines) == 2:
        return ""  # no real data yet, don't pad the prompt
    return "\n".join(lines)


def get_flora_reply(message: str, history: list, context: Optional[dict] = None) -> dict:
    flagged = _is_distress(message)

    system_prompt = FLORA_SYSTEM_PROMPT
    context_block = _build_context_block(context)
    if context_block:
        system_prompt = f"{system_prompt}\n\n{context_block}"

    claude_messages = []
    for turn in history[-20:]:  # cap history so the prompt doesn't grow unbounded
        role = "user" if turn.get("role") == "user" else "assistant"
        content = turn.get("content", "")
        if content:
            claude_messages.append({"role": role, "content": content})
    claude_messages.append({"role": "user", "content": message})

    reply = llm_client.call_claude(system=system_prompt, messages=claude_messages, max_tokens=1024)

    if reply is None:
        # No API key configured, or the call failed — heuristic fallback so
        # /chatbot/ask still works end-to-end for a demo.
        if flagged:
            reply = (
                "That sounds really heavy, and I'm glad you told me. I can't provide "
                "clinical support, but please consider reaching out to a counsellor, "
                "a trusted person, or a helpline. In the meantime, would it help to "
                "take a short break from studying together?"
            )
        else:
            reply = (
                "Hi, I'm Flora! 🌱 I'd love to dig into that with you, but my connection "
                "to the AI backend isn't configured yet on this deployment (no "
                "ANTHROPIC_API_KEY set). Once that's added I'll be able to answer "
                f"properly. For now, here's what you asked: \"{message}\" — let's "
                "come back to this soon!"
            )

    return {"reply": reply, "flagged_for_wellbeing": flagged}


def analyze_study_material(raw_text: str, filename: str = "your uploaded notes") -> str:
    """
    Full Flora document-analysis flow: clean raw extracted PDF text and ask
    Flora to produce the structured Markdown breakdown (Snapshot / Key
    Topics / Schedule / Practice Quiz).
    """
    cleaned = pdf_interface.clean_text(raw_text) if raw_text else ""
    if not cleaned.strip():
        return (
            f"I couldn't pull any readable text out of **{filename}**. It might be a "
            "scanned/image-only PDF — try re-uploading a text-based version, or paste "
            "the notes directly into chat and I'll break them down for you!"
        )

    user_prompt = (
        f'Here is the cleaned text extracted from the student\'s uploaded file '
        f'"{filename}":\n\n---\n{cleaned[:18000]}\n---\n\n'
        "Please produce your full Snapshot / Key Topics / Schedule / Practice Quiz "
        "breakdown for this material, following your Summary & Analysis Output "
        "Format exactly."
    )

    reply = llm_client.call_claude(
        system=FLORA_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
        max_tokens=3000,
    )

    if reply is None:
        return (
            "### Flora's Quick Snapshot\n"
            "- **Topic / Subject:** Unable to analyze right now\n"
            "- **Target Difficulty:** N/A\n"
            f"- **Core Summary:** I couldn't reach my AI backend to analyze "
            f"**{filename}** (no ANTHROPIC_API_KEY configured, or the API call "
            "failed). Ask whoever's running this deployment to set the key, then "
            "try uploading again!"
        )

    return reply
