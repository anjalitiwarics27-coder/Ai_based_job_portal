"""AI Recommendation Engine — Advanced Hybrid System

A comprehensive AI-powered recommendation system combining:
- Content-based filtering (TF-IDF + Cosine Similarity)
- Skill-based matching with fuzzy matching
- Collaborative filtering concepts
- LLM-powered intelligent recommendations
- Explainable AI with detailed reasoning

Candidate profile is analyzed against job requirements using multiple algorithms
for highly accurate, personalized recommendations.
"""
from __future__ import annotations

import json
from collections import Counter
from typing import Dict, List, Tuple

import numpy as np
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
    """Advanced AI-powered candidate ranking using hybrid approach with LLM enhancement."""
    if not candidates:
        return []

    if llm_configured():
        try:
            job_summary = {
                "title": job.title,
                "company": job.company,
                "skills": getattr(job, "skills_list", []) or [],
                "description": (job.description or "")[:350],
                "experience": job.experience or "",
                "location": job.location or "",
                "job_type": getattr(job, "job_type", ""),
            }

            candidate_summaries = []
            for c in candidates[:40]:
                candidate_summaries.append({
                    "id": c.id,
                    "name": getattr(c, "full_name", c.email),
                    "headline": c.headline or "",
                    "skills": [s.strip() for s in (c.skills or "").split(",") if s.strip()],
                    "experience": c.experience or "",
                    "bio": (c.bio or "")[:250],
                    "location": c.location or "",
                })

            system_prompt = (
                "You are an expert AI recruiter with deep understanding of technical roles. "
                "Analyze job requirements and candidate profiles to identify the best matches. "
                "Consider both hard skills and potential. Return ONLY valid JSON."
            )

            user_prompt = (
                f"Job Requirements:\n{json.dumps(job_summary, indent=2)}\n\n"
                f"Candidate Pool:\n{json.dumps(candidate_summaries, indent=2)}\n\n"
                f"Task: Rank the top {min(top_n, len(candidate_summaries))} candidates for this position.\n\n"
                f"Evaluation Criteria:\n"
                f"1. Technical skill match (primary factor)\n"
                f"2. Relevant experience and projects\n"
                f"3. Learning potential and growth mindset\n"
                f"4. Cultural/location fit\n"
                f"5. Overall suitability for the role\n\n"
                f"For each candidate include: candidate_id, match_score (0-100), reasons (array of 2-4 specific reasons).\n"
                f"Be thorough but concise. Prioritize candidates who can add value.\n\n"
                f"Return JSON: {{\"rankings\": [{{\"candidate_id\": ..., \"match_score\": ..., \"reasons\": [...]}}]}}"
            )

            response = chat_complete(system_prompt, user_prompt, max_tokens=1000)
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
                            # Blend with hybrid scoring
                            hybrid_score, hybrid_reasons = hybrid_recommendation_score(
                                cand_map[cand_id], job
                            )
                            blended_score = round(0.7 * score + 0.3 * hybrid_score, 1)
                            all_reasons = list(dict.fromkeys(reasons + hybrid_reasons))
                            results.append({
                                "candidate": cand_map[cand_id],
                                "score": blended_score,
                                "reasons": all_reasons[:5]
                            })
                    if results:
                        results.sort(key=lambda r: r["score"], reverse=True)
                        return results[:top_n]
        except Exception as e:
            print(f"AI candidate ranking failed, falling back to hybrid approach: {e}")

    # Fallback to hybrid ranking
    results = []
    for cand in candidates:
        score, reasons = hybrid_recommendation_score(cand, job)
        results.append({"candidate": cand, "score": score, "reasons": reasons})
    
    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:top_n]


def collaborative_filtering_score(user, job, all_users=None, all_applications=None) -> float:
    """Collaborative filtering based on similar users' applications."""
    try:
        if not all_applications or not all_users:
            return 0.0
        
        # Find users with similar skills
        user_skills = set([s.lower().strip() for s in (getattr(user, "skills", "") or "").split(",") if s.strip()])
        if not user_skills:
            return 0.0
        
        similar_users = []
        for other_user in all_users:
            if other_user.id == user.id:
                continue
            other_skills = set([s.lower().strip() for s in (other_user.skills or "").split(",") if s.strip()])
            if other_skills:
                # Jaccard similarity
                intersection = len(user_skills.intersection(other_skills))
                union = len(user_skills.union(other_skills))
                if union > 0 and intersection / union > 0.3:  # 30% similarity
                    similar_users.append(other_user.id)
        
        if not similar_users:
            return 0.0
        
        # Check if similar users applied to this job
        applied_count = 0
        for app in all_applications:
            if app.job_id == job.id and app.candidate_id in similar_users:
                applied_count += 1
        
        # Score based on popularity among similar users
        score = min(100.0, (applied_count / len(similar_users)) * 100.0)
        return round(score, 1)
    except Exception:
        return 0.0


def hybrid_recommendation_score(user, job, all_users=None, all_applications=None) -> Tuple[float, List[str]]:
    """Hybrid scoring combining content-based, collaborative, and skill matching."""
    reasons = []
    scores = []
    
    # Content-based (TF-IDF style) - skill overlap
    content_score = overlap_score(user, job)
    scores.append(content_score * 0.4)
    content_reasons = overlap_reasons(user, job)
    reasons.extend(content_reasons)
    
    # Skill exact match bonus
    user_skills = set([s.lower().strip() for s in (getattr(user, "skills", "") or "").split(",") if s.strip()])
    job_skills = set([s.lower().strip() for s in getattr(job, "skills_list", []) or []])
    if user_skills and job_skills:
        skill_match_ratio = len(user_skills.intersection(job_skills)) / len(job_skills)
        skill_bonus = skill_match_ratio * 30
        scores.append(skill_bonus * 0.2)
        if skill_match_ratio > 0.5:
            reasons.append(f"Strong skill match ({int(skill_match_ratio*100)}% of job requirements)")
    
    # Experience level matching
    user_exp = (getattr(user, "experience", "") or "").lower()
    job_exp = (job.experience or "").lower()
    if user_exp and job_exp:
        exp_keywords = ["fresher", "entry", "junior", "mid", "senior", "lead"]
        user_level = next((k for k in exp_keywords if k in user_exp), "")
        job_level = next((k for k in exp_keywords if k in job_exp), "")
        if user_level and job_level and user_level == job_level:
            scores.append(10 * 0.15)
            reasons.append("Experience level matches perfectly")
        elif user_level and job_level:
            # Adjacent levels get partial score
            idx_user = exp_keywords.index(user_level) if user_level in exp_keywords else -1
            idx_job = exp_keywords.index(job_level) if job_level in exp_keywords else -1
            if idx_user >= 0 and idx_job >= 0 and abs(idx_user - idx_job) <= 1:
                scores.append(5 * 0.15)
                reasons.append("Experience level is compatible")
        else:
            scores.append(7.5 * 0.15)
    else:
        scores.append(5 * 0.15)
    
    # Location preference
    user_loc = (getattr(user, "location", "") or "").lower()
    job_loc = (job.location or "").lower()
    if user_loc and job_loc:
        if "remote" in job_loc or user_loc in job_loc or job_loc in user_loc:
            scores.append(10 * 0.15)
            reasons.append("Location is a great fit")
        else:
            scores.append(3 * 0.15)
    else:
        scores.append(5 * 0.15)
    
    # Collaborative filtering
    collab_score = collaborative_filtering_score(user, job, all_users, all_applications)
    if collab_score > 0:
        scores.append(collab_score * 0.1)
        if collab_score > 60:
            reasons.append("Popular among candidates with similar profiles")
    
    final_score = sum(scores)
    final_score = round(max(0.0, min(100.0, final_score)), 1)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_reasons = []
    for r in reasons:
        if r not in seen:
            unique_reasons.append(r)
            seen.add(r)
    
    if not unique_reasons:
        unique_reasons.append("Good overall profile match")
    
    return final_score, unique_reasons[:5]


def ai_recommend_jobs(user, jobs: list, top_n: int = 10, all_users=None, all_applications=None) -> list[dict]:
    """Advanced AI-powered job recommendations using hybrid approach with LLM enhancement."""
    if not jobs:
        return []

    # Try LLM-based recommendations if configured
    if llm_configured():
        try:
            # Prepare detailed job list for LLM
            job_summaries = []
            for j in jobs[:40]:  # Limit to avoid token overflow
                job_summaries.append({
                    "id": j.id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "job_type": j.job_type,
                    "skills": getattr(j, "skills_list", []) or [],
                    "description": (j.description or "")[:250],
                    "experience": j.experience or "",
                    "category": getattr(j, "category", ""),
                })

            user_profile = {
                "name": getattr(user, "full_name", ""),
                "headline": getattr(user, "headline", ""),
                "skills": [s.strip() for s in (getattr(user, "skills", "") or "").split(",") if s.strip()],
                "experience": getattr(user, "experience", ""),
                "bio": (getattr(user, "bio", "") or "")[:250],
                "location": getattr(user, "location", ""),
                "phone": getattr(user, "phone", ""),
            }

            system_prompt = (
                "You are an advanced AI job recommendation engine for HireNova AI job portal. "
                "Your task is to provide highly personalized, accurate job recommendations. "
                "Consider skill compatibility, experience level, career growth potential, and cultural fit. "
                "Return ONLY valid JSON with no additional text."
            )

            user_prompt = (
                f"Candidate Profile:\n{json.dumps(user_profile, indent=2)}\n\n"
                f"Available Job Listings:\n{json.dumps(job_summaries, indent=2)}\n\n"
                f"Task: Recommend the top {min(top_n, len(job_summaries))} most suitable jobs for this candidate.\n\n"
                f"Requirements:\n"
                f"1. For each recommendation, include: job_id, match_score (0-100, be realistic and accurate), \n"
                f"2. reasons (array of 2-4 specific, actionable reasons explaining the match),\n"
                f"3. Consider: technical skill match, soft skills implied, experience alignment, location, growth opportunity\n"
                f"4. Prioritize jobs where candidate has strong skill overlap\n"
                f"5. Be honest about match quality\n\n"
                f"Return JSON in format: {{\"recommendations\": [{{\"job_id\": ..., \"match_score\": ..., \"reasons\": [...]}}]}}"
            )

            response = chat_complete(system_prompt, user_prompt, max_tokens=1000)
            if response:
                try:
                    # Extract JSON from response
                    start = response.find('{')
                    end = response.rfind('}') + 1
                    if start >= 0 and end > start:
                        json_str = response[start:end]
                        result = json.loads(json_str)
                        recommendations = result.get('recommendations', [])
                    else:
                        start = response.find('[')
                        end = response.rfind(']') + 1
                        if start >= 0 and end > start:
                            recommendations = json.loads(response[start:end])
                        else:
                            recommendations = []
                except Exception:
                    recommendations = []

                if recommendations:
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
                            # Enhance with hybrid scoring
                            hybrid_score, hybrid_reasons = hybrid_recommendation_score(
                                user, job_map[job_id], all_users, all_applications
                            )
                            # Blend LLM score (70%) with hybrid score (30%)
                            blended_score = round(0.7 * score + 0.3 * hybrid_score, 1)
                            # Merge reasons
                            all_reasons = list(dict.fromkeys(reasons + hybrid_reasons))
                            results.append({
                                "job": job_map[job_id],
                                "score": blended_score,
                                "reasons": all_reasons[:5]
                            })
                    if results:
                        results.sort(key=lambda r: r["score"], reverse=True)
                        return results[:top_n]
        except Exception as e:
            print(f"AI recommendation failed, falling back to hybrid approach: {e}")

    # Fallback to hybrid recommendation system
    results = []
    for job in jobs:
        score, reasons = hybrid_recommendation_score(user, job, all_users, all_applications)
        results.append({"job": job, "score": score, "reasons": reasons})
    
    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:top_n]
