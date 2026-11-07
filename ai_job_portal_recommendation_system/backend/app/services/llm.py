"""LLM provider — OpenAI if OPENAI_API_KEY set, else None (rule-based fallback)."""
from __future__ import annotations

import os

MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")


def llm_configured() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def chat_complete(system: str, user: str, max_tokens: int = 600) -> str | None:
    """Return LLM completion or None if not configured / failed."""
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None
    try:
        from openai import OpenAI

        client = OpenAI(api_key=key)
        res = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=max_tokens,
            temperature=0.7,
        )
        return (res.choices[0].message.content or "").strip() or None
    except Exception as e:  # pragma: no cover
        print(f"LLM failed, falling back: {e}")
        return None


SYSTEM_PROMPT = (
    "You are Nova, the HireNova AI career assistant for an Indian AI job portal. "
    "Be concise, helpful, and encouraging. Suggest concrete next steps. "
    "Never ask for passwords or OTPs."
)


def llm_chat_reply(message: str, user=None, history=None) -> str | None:
    ctx = ""
    if user is not None:
        ctx = f"\nUser: {user.full_name}, skills: {user.skills or '—'}, headline: {user.headline or '—'}"
    msgs = []
    if history:
        for h in history[-6:]:
            msgs.append(f"{h.get('role','user')}: {h.get('content','')}")
    user_text = ("\n".join(msgs) + f"\nuser: {message}{ctx}").strip()
    return chat_complete(SYSTEM_PROMPT, user_text)


def llm_cover_letter(user, job) -> str | None:
    prompt = (
        f"Write a short, professional cover letter (150-200 words) for {user.full_name} "
        f"applying to {job.title} at {job.company}. Skills: {user.skills or '—'}. "
        f"Use a warm, confident tone. End with contact line."
    )
    return chat_complete("You write crisp, ATS-friendly cover letters.", prompt, max_tokens=500)


def llm_interview_questions(topic: str, count: int = 5) -> list[str] | None:
    out = chat_complete(
        "You are a senior interviewer. Return ONLY a numbered list of questions.",
        f"Give {count} interview questions on '{topic}'. One per line, numbered.",
        max_tokens=400,
    )
    if not out:
        return None
    qs = []
    for line in out.splitlines():
        line = line.strip()
        if line and line[0].isdigit() or line.startswith("-"):
            qs.append(line.lstrip("0123456789.- ").strip())
    return [q for q in qs if q] or None
