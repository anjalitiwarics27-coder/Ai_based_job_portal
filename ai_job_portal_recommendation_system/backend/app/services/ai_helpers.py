"""Cover letter generator, chatbot brain, and interview question bank.

These are deterministic template + rules engines (no external API key needed)
so the project runs offline. Swap in an LLM call later if desired — the
function signatures stay the same.
"""
from __future__ import annotations

import random
import re

INTERVIEW_BANK = {
    "python": [
        "What's the difference between a list and a tuple in Python? When would you use each?",
        "How does Python's GIL work and what are its practical implications?",
        "Walk me through how you'd optimise a slow Python script.",
        "What is a decorator? Show me a simple example.",
    ],
    "javascript": [
        "What is the difference between `var`, `let`, and `const`?",
        "Explain the event loop in JavaScript with an example.",
        "How does `this` binding work in JavaScript?",
        "What are closures? Give a real-world use case.",
    ],
    "react": [
        "Functional vs class components — what's the practical difference?",
        "How does React's reconciliation work?",
        "When would you use `useEffect` vs `useLayoutEffect`?",
        "How do you optimise a slow React app?",
    ],
    "default": [
        "Tell me about the most challenging project you've done.",
        "Why are you a good fit for this role?",
        "Describe a time you debugged something difficult.",
        "Where do you see yourself in 2 years?",
        "How do you stay up to date with new technology?",
    ],
}


def generate_cover_letter(user, job) -> str:
    name = getattr(user, "full_name", "Candidate") or "Candidate"
    skills = [s.strip() for s in (getattr(user, "skills", "") or "").split(",") if s.strip()]
    skill_line = ", ".join(skills[:6]) or "my technical stack"
    company = getattr(job, "company", "your company")
    title = getattr(job, "title", "your open role")
    return (
        f"Dear Hiring Team at {company},\n\n"
        f"I am excited to apply for the {title} position. With experience in {skill_line}, "
        f"along with strong problem-solving and teamwork skills, I am confident I can contribute "
        f"meaningfully to your team from day one.\n\n"
        f"During my work, I have focused on building clean, reliable solutions — from understanding "
        f"requirements and writing maintainable code to testing, documenting, and shipping on time. "
        f"I learn quickly, communicate clearly, and take ownership of the outcomes I deliver.\n\n"
        f"I would welcome the opportunity to discuss how my background aligns with your team's goals. "
        f"Thank you for your consideration — I look forward to speaking with you.\n\n"
        f"Sincerely,\n{name}\n"
        f"{getattr(user, 'email', '')} | {getattr(user, 'phone', '')} | {getattr(user, 'location', '')}"
    )


def chatbot_reply(message: str, user=None, history: list | None = None) -> str:
    msg = (message or "").lower().strip()
    skills = [s.strip() for s in (getattr(user, "skills", "") or "").split(",") if s.strip()] if user else []
    skill_text = ", ".join(skills[:5]) if skills else "your listed skills"

    if any(w in msg for w in ["hello", "hi", "hey", "namaste"]):
        return (
            f"Hello! I'm Nova, your HireNova AI career assistant. "
            f"I can help you improve your resume, find matching jobs, prepare for interviews, "
            f"or craft a cover letter. What would you like to start with?"
        )
    if "resume" in msg or "cv" in msg:
        return (
            f"Your profile currently lists: {skill_text}. "
            f"To boost your ATS score: keep it to 1-2 pages, add quantified impact "
            f"('increased X by 30%'), and mirror the job description keywords. "
            f"Head to Resume Analyzer to get an instant score and suggestions."
        )
    if "job" in msg or "vacancy" in msg or "hiring" in msg:
        return (
            "I can surface your best matches right now. Go to 'AI Recommendation' — "
            "we rank every live role by skill overlap, seniority and location, "
            "and show you the reason for each match. Tip: keep your skills list updated."
        )
    if "interview" in msg or "prepare" in msg or "question" in msg:
        topic = "default"
        for k in INTERVIEW_BANK:
            if k in msg:
                topic = k
                break
        q = random.choice(INTERVIEW_BANK[topic])
        return f"Let's do interview prep ({topic}). Try answering this out loud:\n\n{q}\n\nTip: use STAR (Situation-Task-Action-Result)."
    if "cover" in msg or "letter" in msg:
        return (
            "I generate tailored cover letters from your profile + the job. "
            "Open a job, click 'Cover Letter', and I'll draft one in seconds — "
            "you can then edit before applying."
        )
    if "salary" in msg:
        return (
            "Salary depends on role, city and experience band. On HireNova AI, "
            "job cards show the posted range (e.g. ₹12–18 LPA). For interviews, "
            "research the band on Glassdoor/AmbitionBox and anchor to market + your "
            "recent offers. Want tips for negotiating?"
        )
    if "thank" in msg:
        return "You're welcome! Anything else — a mock interview question, a job shortlist, or cover letter help?"
    if "bye" in msg or "alvida" in msg:
        return "Goodbye and good luck with your applications! I'm here whenever you need a hand."

    # gentle fallback
    return (
        f"I can help with jobs, resume tips, interview prep, and cover letters. "
        f"You mentioned '{message[:60]}' — try asking: 'Suggest interview questions on Python' "
        f"or 'How do I improve my resume?'"
    )


def interview_questions(topic: str, count: int = 5) -> list[str]:
    key = (topic or "default").lower()
    bank = INTERVIEW_BANK.get(key, INTERVIEW_BANK["default"])
    seen = list(bank)
    random.shuffle(seen)
    # top up with default if needed
    while len(seen) < count:
        seen.append(random.choice(INTERVIEW_BANK["default"]))
    return seen[:count]
