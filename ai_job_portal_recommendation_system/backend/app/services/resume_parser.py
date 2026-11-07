"""Resume parsing + ATS scoring (PDF/DOCX/TXT)."""
from __future__ import annotations

import json
import re

from .matcher import KNOWN_SKILLS

MAX_CHARS = 20000


def extract_text(filepath: str) -> str:
    lower = filepath.lower()
    if lower.endswith(".pdf"):
        return _pdf_text(filepath)
    if lower.endswith(".docx"):
        return _docx_text(filepath)
    if lower.endswith(".txt"):
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return f.read(MAX_CHARS)
    raise ValueError("Unsupported file type — upload PDF, DOCX or TXT only.")


def _pdf_text(filepath: str) -> str:
    try:
        from pypdf import PdfReader

        reader = PdfReader(filepath)
        return "\n".join((p.extract_text() or "") for p in reader.pages)[:MAX_CHARS]
    except Exception:
        try:
            import pymupdf  # fitz

            doc = pymupdf.open(filepath)
            return "\n".join(page.get_text() for page in doc)[:MAX_CHARS]
        except Exception as e:
            raise ValueError(f"Could not read PDF: {e}")


def _docx_text(filepath: str) -> str:
    try:
        from docx import Document

        doc = Document(filepath)
        return "\n".join(p.text for p in doc.paragraphs)[:MAX_CHARS]
    except ImportError:
        # fallback: docx is a zip of XML — pull raw text nodes
        import zipfile
        import xml.etree.ElementTree as ET

        with zipfile.ZipFile(filepath) as z:
            xml = z.read("word/document.xml")
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        root = ET.fromstring(xml)
        texts = [n.text for n in root.iter("{%s}t" % ns["w"]) if n.text]
        return " ".join(texts)[:MAX_CHARS]


def extract_skills(text: str) -> list[str]:
    lowered = text.lower()
    found = [s for s in KNOWN_SKILLS if re.search(r"\b" + re.escape(s.lower()) + r"\b", lowered)]
    # also catch comma/bullet lists like "React, Node" — keep simple.
    return sorted(set(found))


def ats_score(text: str, skills: list[str]) -> tuple[int, dict]:
    """Rule-based ATS score (0-100) + feedback dict."""
    score = 0
    text_lower = text.lower()
    feedback = {}

    # Length / substance
    words = len(text.split())
    if words >= 300:
        score += 20
        feedback["length"] = "Good length"
    elif words >= 150:
        score += 12
        feedback["length"] = "Add a bit more project detail"
    else:
        score += 4
        feedback["length"] = "Resume is short — add projects/impact"

    # Skills
    if len(skills) >= 8:
        score += 25
        feedback["skills"] = f"Strong skill coverage ({len(skills)} skills)"
    elif len(skills) >= 4:
        score += 15
        feedback["skills"] = f"Add 2-4 more role-relevant skills (found {len(skills)})"
    else:
        score += 5
        feedback["skills"] = f"Few technical skills detected ({len(skills)}) — list your stack explicitly"

    # Sections
    sections = ["experience", "education", "project", "skill", "summary"]
    hits = sum(1 for s in sections if s in text_lower)
    if hits >= 4:
        score += 20
        feedback["sections"] = "All core sections present"
    elif hits >= 2:
        score += 12
        feedback["sections"] = "Missing some sections (try Summary, Experience, Projects, Education, Skills)"
    else:
        score += 4
        feedback["sections"] = "Add clear sections: Summary, Skills, Experience, Projects, Education"

    # Contact basics
    has_email = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text))
    has_phone = bool(re.search(r"(\+?\d[\d\s-]{7,}\d)", text))
    if has_email and has_phone:
        score += 15
        feedback["contact"] = "Contact details present"
    elif has_email or has_phone:
        score += 8
        feedback["contact"] = "Add both email and phone"
    else:
        score += 0
        feedback["contact"] = "Add email and phone at top"

    # Projects / impact keywords
    impact = ["project", "built", "developed", "increased", "improved", "deployed", "result", "%"]
    if sum(1 for w in impact if w in text_lower) >= 4:
        score += 20
        feedback["impact"] = "Good impact-oriented language"
    elif sum(1 for w in impact if w in text_lower) >= 2:
        score += 12
        feedback["impact"] = "Add measurable impact (e.g. 'increased API speed by 30%')"
    else:
        score += 5
        feedback["impact"] = "Quantify achievements with numbers"

    return min(100, score), feedback


def analyze_resume_text(text: str) -> dict:
    skills = extract_skills(text)
    score, feedback = ats_score(text, skills)
    suggestions = [v for v in feedback.values() if "Add" in v or "Missing" in v or "Quantify" in v]
    return {
        "skills": skills,
        "score": score,
        "feedback": feedback,
        "suggestions": suggestions[:5],
        "summary": "Excellent" if score >= 80 else ("Good" if score >= 60 else "Needs work"),
    }
