"""
Flora Chatbot — interface contract for Person 4 (Chatbot / PDF parsing).

Person 4: implement `get_flora_reply` to call your real NLP/LLM backend for
academic Q&A + supportive conversation. The stub below keeps the
/chatbot/ask endpoint functional for demos in the meantime, and does basic
keyword-based distress detection so the API can flag a message and raise a
wellbeing notification for the frontend to surface.

Keep the return shape {"reply": str, "flagged_for_wellbeing": bool} so
routers/chatbot.py doesn't need to change.

Note: Flora is positioned as supportive/motivational chat, not clinical
mental-health treatment — keep that framing in the real implementation too
(see the Critical Review doc's note on this being an overstated-capability
risk if it isn't handled carefully in the demo).
"""
DISTRESS_KEYWORDS = ["hopeless", "can't cope", "cant cope", "give up", "worthless", "panic attack"]


def get_flora_reply(message: str, history: list) -> dict:
    lowered = message.lower()
    flagged = any(kw in lowered for kw in DISTRESS_KEYWORDS)

    if flagged:
        reply = (
            "That sounds really heavy, and I'm glad you told me. I can't provide "
            "clinical support, but please consider reaching out to a counsellor, "
            "a trusted person, or a helpline. In the meantime, would it help to "
            "take a short break from studying together?"
        )
    else:
        reply = (
            f"(placeholder Flora reply — Person 4 will connect the real NLP/LLM "
            f"backend here) You asked: \"{message}\". Let's break that down together."
        )

    return {"reply": reply, "flagged_for_wellbeing": flagged}
