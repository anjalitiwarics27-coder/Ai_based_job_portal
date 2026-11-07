"""AI recommendation engine — TF-IDF + cosine similarity with explainable reasons.

Candidate profile (skills + headline + experience) is vectorised together
with every active job (title + skills + description + company + location)
and scored by cosine similarity. Reasons are derived from skill overlap
so the UI can show *why* a job matched.

Also supports optional LLM-enhanced recommendations when configured.
"""
from __future__ import annotations

import json

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .llm import chat_complete, llm_configured

SKILL_ALIASES = {
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "machine learning": ["machine learning", "ml", "ai"],
    "artificial intelligence": ["artificial intelligence", "ai"],
    "data science": ["data science", "data analyst"],
}

# A curated skills vocabulary — used for resume parsing + ATS scoring.
KNOWN_SKILLS = [
    "Python", "Java", "C++", "C", "JavaScript", "TypeScript", "HTML", "CSS",
    "React", "Angular", "Vue", "Node.js", "Express", "MongoDB", "SQL",
    "MySQL", "PostgreSQL", "Django", "Flask", "FastAPI", "TensorFlow",
    "PyTorch", "Machine Learning", "Deep Learning", "Data Science",
    "Data Analyst", "Pandas", "NumPy", "Scikit-learn", "Excel",
    "Git", "GitHub", "Docker", "Kubernetes", "AWS", "Azure",
    "Linux", "Figma", "UI Design", "UX Design", "Tailwind CSS",
    "Flutter", "Android", "iOS", "Spring Boot", "REST API",
]


def normalize_skills(skills: list[str]) -> list[str]:
    out = []
    for s in skills:
        s = (s or "").strip()
        if s:
            out.append(s)
    return out


def candidate_doc(user) -> str:
    parts = [
        getattr(user, "headline", "") or "",
        getattr(user, "skills", "") or "",
        getattr(user, "experience", "") or "",
        getattr(user, "bio", "") or "",
    ]
    # widen with generic role terms so freshers still get matches
    return " ".join(parts).strip() or "fresher developer"


def job_doc(job) -> str:
    parts = [
        job.title or "",
        job.company or "",
        job.skills or "",
        job.description or "",
        job.location or "",
        job.category or "",
    ]
    return " ".join(parts)


def match_score_for(user, job, vectorizer=None, matrix=None, job_index=None) -> tuple[float, list[str]]:
    """Return (score 0-100, reasons) for a single job vs user."""
    reasons = overlap_reasons(user, job)
    if vectorizer is None or matrix is None or job_index is None:
        # fallback: pure skill-overlap scoring (no sklearn needed)
        return overlap_score(user, job), reasons
    vec = vectorizer.transform([candidate_doc(user)])
    score = float(cosine_similarity(vec, matrix[job_index])[0][0]) * 100
    return round(max(0.0, min(100.0, score)), 1), reasons


def overlap_reasons(user, job) -> list[str]:
    cand = {s.lower() for s in (getattr(user, "skills", "") or "").split(",") if s.strip()}
    cand.update({s.lower() for s in (getattr(user, "headline", "") or "").split()})
    job_skills = [s for s in getattr(job, "skills_list", []) or []]
    hits = [s for s in job_skills if s.lower() in {c for c in cand}]
    # fuzzy: substring match either way
    hits_lower = {h.lower() for h in hits}
    for s in job_skills:
        sl = s.lower()
        for c in cand:
            if sl in c or c in sl:
                if sl not in hits_lower:
                    hits.append(s)
                    hits_lower.add(sl)
    reasons = []
    if hits:
        reasons.append(f"Skill overlap: {', '.join(hits[:5])}")
    if (getattr(user, "location", "") or "").strip() and (getattr(user, "location", "") or "").strip().lower() in (job.location or "").lower():
        reasons.append("Location preference matches")
    if (getattr(user, "experience", "") or "").strip() and (getattr(user, "experience", "") or "").strip().lower() in (job.experience or "").lower():
        reasons.append("Experience band matches")
    if not reasons:
        reasons.append("Profile near-miss — add more matching skills to improve score")
    return reasons


def overlap_score(user, job) -> float:
    cand = {s.lower() for s in (getattr(user, "skills", "") or "").split(",") if s.strip()}
    job_skills = job.skills_list or []
    if not job_skills:
        return 50.0
    hits = sum(1 for s in job_skills if s.lower() in cand)
    # partial credit for substring
    for s in job_skills:
        if s.lower() not in cand:
            for c in cand:
                if s.lower() in c or c in s.lower():
                    hits += 0.5
                    break
    return round(100.0 * (hits / len(job_skills)), 1)


def recommend_jobs(user, jobs: list, top_n: int = 10) -> list[dict]:
    """Rank jobs for a user. Returns [{job, score, reasons}] sorted desc."""
    if not jobs:
        return []
    corpus = [candidate_doc(user)] + [job_doc(j) for j in jobs]
    try:
        vec = TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2))
        matrix = vec.fit_transform(corpus)
        cand_vec = matrix[0]
        job_matrix = matrix[1:]
        sims = cosine_similarity(cand_vec, job_matrix)[0]
    except Exception:
        sims = None

    results = []
    for i, job in enumerate(jobs):
        if sims is not None:
            score = round(float(sims[i]) * 100, 1)
        else:
            score = overlap_score(user, job)
        # blend a little skill-overlap so scores feel explainable
        overlap = overlap_score(user, job)
        blended = round(0.75 * score + 0.25 * overlap, 1)
        results.append({"job": job, "score": blended, "reasons": overlap_reasons(user, job)})

    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:top_n]


def rank_candidates(job, candidates: list, top_n: int = 20) -> list[dict]:
    """Employer side: rank applicants for one job."""
    if not candidates:
        return []
    corpus = [job_doc(job)] + [candidate_doc(c) for c in candidates]
    try:
        vec = TfidfVectorizer(stop_words="english", max_features=5000)
        matrix = vec.fit_transform(corpus)
        sims = cosine_similarity(matrix[0], matrix[1:])[0]
    except Exception:
        sims = None
    results = []
    for i, cand in enumerate(candidates):
        score = round(float(sims[i]) * 100, 1) if sims is not None else overlap_score(cand, job)
        results.append({"candidate": cand, "score": score, "reasons": overlap_reasons(cand, job)})
    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:top_n]


def ai_rank_candidates(job, candidates: list, top_n: int = 20) -> list[dict]:
    """AI-powered candidate ranking using LLM when available, falls back to TF-IDF."""
    if not candidates:
        return []

    if llm_configured():
        try:
            job_summary = {
                "title": job.title,
                "company": job.company,
                "skills": getattr(job, "skills_list", []) or [],
                "description": (job.description or "")[:300],
                "experience": job.experience or "",
                "location": job.location or "",
            }

            candidate_summaries = []
            for c in candidates[:30]:
                candidate_summaries.append({
                    "id": c.id,
                    "name": getattr(c, "full_name", c.email),
                    "headline": c.headline or "",
                    "skills": [s.strip() for s in (c.skills or "").split(",") if s.strip()],
                    "experience": c.experience or "",
                    "bio": (c.bio or "")[:200],
                    "location": c.location or "",
                })

            system_prompt = (
                "You are an expert AI recruiter. Analyze job requirements and candidate profiles "
                "to rank candidates. Return ONLY valid JSON."
            )

            user_prompt = (
                f"Job Requirements:\n{json.dumps(job_summary, indent=2)}\n\n"
                f"Candidates:\n{json.dumps(candidate_summaries, indent=2)}\n\n"
                f"Rank the top {min(top_n, len(candidate_summaries))} candidates. "
                f"For each, return: candidate_id, match_score (0-100), reasons (array of strings). "
                f"Consider skill fit, relevant experience, and overall suitability."
            )

            response = chat_complete(system_prompt, user_prompt, max_tokens=800)
            if response:
                try:
                    start = response.find('{')
                    end = response.rfind('}') + 1
                    if start >= 0 and end > start:
                        json_str = response[start:end]
                        result = json.loads(json_str)
                        rankings = result.get('rankings', result.get('candidates', []))
                    else:
                        start = response.find('[')
                        end = response.rfind(']') + 1
                        if start >= 0 and end > start:
                            rankings = json.loads(response[start:end])
                        else:
                            rankings = []
                except Exception:
                    rankings = []

                if rankings:
                    cand_map = {c.id: c for c in candidates}
                    results = []
                    for rec in rankings:
                        cand_id = rec.get('candidate_id') or rec.get('id')
                        if cand_id in cand_map:
                            score = float(rec.get('match_score', rec.get('score', 0)))
                            score = round(max(0.0, min(100.0, score)), 1)
                            reasons = rec.get('reasons', []) or []
                            if isinstance(reasons, str):
                                reasons = [reasons]
                            if not reasons:
                                reasons = overlap_reasons(cand_map[cand_id], job)
                            results.append({
                                "candidate": cand_map[cand_id],
                                "score": score,
                                "reasons": reasons[:4]
                            })
                    if results:
                        results.sort(key=lambda r: r["score"], reverse=True)
                        return results[:top_n]
        except Exception as e:
            print(f"AI candidate ranking failed, falling back to TF-IDF: {e}")

    return rank_candidates(job, candidates, top_n=top_n)


def ai_recommend_jobs(user, jobs: list, top_n: int = 10) -> list[dict]:
    """AI-powered job recommendations using LLM when available, falls back to TF-IDF."""
    if not jobs:
        return []

    # Try LLM-based recommendations if configured
    if llm_configured():
        try:
            # Prepare concise job list for LLM
            job_summaries = []
            for j in jobs[:30]:  # Limit to avoid token overflow
                job_summaries.append({
                    "id": j.id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "skills": getattr(j, "skills_list", []) or [],
                    "description": (j.description or "")[:200],
                    "experience": j.experience or "",
                })

            user_profile = {
                "name": getattr(user, "full_name", ""),
                "headline": getattr(user, "headline", ""),
                "skills": [s.strip() for s in (getattr(user, "skills", "") or "").split(",") if s.strip()],
                "experience": getattr(user, "experience", ""),
                "bio": (getattr(user, "bio", "") or "")[:200],
                "location": getattr(user, "location", ""),
            }

            system_prompt = (
                "You are an expert AI job recommendation engine. "
                "Analyze the candidate profile and job listings to provide personalized, "
                "explainable job recommendations. Return ONLY valid JSON."
            )

            user_prompt = (
                f"Candidate Profile:\n{json.dumps(user_profile, indent=2)}\n\n"
                f"Available Jobs:\n{json.dumps(job_summaries, indent=2)}\n\n"
                f"Recommend the top {min(top_n, len(job_summaries))} most suitable jobs. "
                f"For each recommendation, return: job_id, match_score (0-100), reasons (array of strings explaining why). "
                f"Prioritize skill match, relevant experience, and location fit. Be specific and helpful."
            )

            response = chat_complete(system_prompt, user_prompt, max_tokens=800)
            if response:
                # Extract JSON from response
                try:
                    # Try to find JSON in the response
                    start = response.find('{')
                    end = response.rfind('}') + 1
                    if start >= 0 and end > start:
                        json_str = response[start:end]
                        result = json.loads(json_str)
                        recommendations = result.get('recommendations', [])
                    else:
                        # Try parsing as array
                        start = response.find('[')
                        end = response.rfind(']') + 1
                        if start >= 0 and end > start:
                            recommendations = json.loads(response[start:end])
                        else:
                            recommendations = []
                except Exception:
                    recommendations = []

                if recommendations:
                    # Map back to job objects
                    job_map = {j.id: j for j in jobs}
                    results = []
                    for rec in recommendations:
                        job_id = rec.get('job_id') or rec.get('id')
                        if job_id in job_map:
                            score = float(rec.get('match_score', rec.get('score', 0)))
                            score = round(max(0.0, min(100.0, score)), 1)
                            reasons = rec.get('reasons', []) or rec.get('explanation', [])
                            if isinstance(reasons, str):
                                reasons = [reasons]
                            if not reasons:
                                reasons = overlap_reasons(user, job_map[job_id])
                            results.append({
                                "job": job_map[job_id],
                                "score": score,
                                "reasons": reasons[:4]
                            })
                    if results:
                        results.sort(key=lambda r: r["score"], reverse=True)
                        return results[:top_n]
        except Exception as e:
            print(f"AI recommendation failed, falling back to TF-IDF: {e}")

    # Fallback to traditional TF-IDF recommendations
    return recommend_jobs(user, jobs, top_n=top_n)
