"""Employer workspace: dashboard, my jobs, applicants, ranking."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..models import Application, db, Job, User
from ..services.matcher import ai_rank_candidates as rank_candidates
from .helpers import err, ok, paginate, require_role, validate_pagination

employer_bp = Blueprint("employer", __name__, url_prefix="/api/employer")


@employer_bp.get("/dashboard")
@jwt_required()
def dashboard():
    user, e = require_role("employer", "admin")
    if e:
        return e
    jobs = Job.query.filter_by(employer_id=user.id, is_active=True).all() if user.role != "admin" \
        else Job.query.filter_by(is_active=True).all()
    job_ids = [j.id for j in jobs]
    apps = Application.query.filter(Application.job_id.in_(job_ids)).order_by(Application.created_at.desc()).all() if job_ids else []
    return ok({
        "user": user.to_dict(),
        "stats": {
            "active_jobs": len(jobs),
            "total_applications": len(apps),
            "interviews": Application.query.filter(
                Application.job_id.in_(job_ids or [0]), Application.status == "Interview").count() if job_ids else 0,
            "shortlisted": Application.query.filter(
                Application.job_id.in_(job_ids or [0]), Application.status == "Shortlisted").count() if job_ids else 0,
        },
        "jobs": [j.to_dict() for j in jobs[:10]],
        "recent_applications": [a.to_dict() for a in apps[:10]],
    })


@employer_bp.get("/jobs")
@jwt_required()
def my_jobs():
    user, e = require_role("employer", "admin")
    if e:
        return e
    q = Job.query.filter_by(employer_id=user.id).order_by(Job.created_at.desc()) if user.role != "admin" \
        else Job.query.order_by(Job.created_at.desc())
    page, per_page = validate_pagination(request.args)
    items, total = paginate(q, page, per_page)
    return ok({"jobs": [j.to_dict() for j in items], "total": total, "page": page, "per_page": per_page})


@employer_bp.get("/jobs/<int:job_id>/applicants")
@jwt_required()
def applicants(job_id: int):
    user, e = require_role("employer", "admin")
    if e:
        return e
    job = db.session.get(Job, job_id)
    if not job:
        return err("Job not found", 404)
    if user.role != "admin" and job.employer_id != user.id:
        return err("Forbidden", 403)
    apps = Application.query.filter_by(job_id=job.id).order_by(Application.created_at.desc()).all()
    out = []
    for a in apps:
        cand = db.session.get(User, a.candidate_id)
        out.append({"application": a.to_dict(), "candidate": cand.to_dict() if cand else None})
    return ok({"job": job.to_dict(), "applicants": out})


@employer_bp.get("/jobs/<int:job_id>/ranking")
@jwt_required()
def ranking(job_id: int):
    user, e = require_role("employer", "admin")
    if e:
        return e
    job = db.session.get(Job, job_id)
    if not job:
        return err("Job not found", 404)
    if user.role != "admin" and job.employer_id != user.id:
        return err("Forbidden", 403)
    apps = Application.query.filter_by(job_id=job.id).all()
    candidates = [db.session.get(User, a.candidate_id) for a in apps]
    candidates = [c for c in candidates if c]
    ranked = rank_candidates(job, candidates, top_n=50)
    return ok({
        "job": job.to_dict(),
        "ranking": [
            {"candidate": r["candidate"].to_dict(), "match_score": r["score"], "reasons": r["reasons"]}
            for r in ranked
        ],
        "algorithm": "AI-Hybrid Ranking System"
    })


@employer_bp.get("/jobs/<int:job_id>/ai-ranking")
@jwt_required()
def ai_ranking(job_id: int):
    """Advanced AI-powered candidate ranking."""
    user, e = require_role("employer", "admin")
    if e:
        return e
    job = db.session.get(Job, job_id)
    if not job:
        return err("Job not found", 404)
    if user.role != "admin" and job.employer_id != user.id:
        return err("Forbidden", 403)
    apps = Application.query.filter_by(job_id=job.id).all()
    candidates = [db.session.get(User, a.candidate_id) for a in apps]
    candidates = [c for c in candidates if c]
    from ..services.matcher import ai_rank_candidates
    ranked = ai_rank_candidates(job, candidates, top_n=50)
    return ok({
        "job": job.to_dict(),
        "ranking": [
            {"candidate": r["candidate"].to_dict(), "match_score": r["score"], "reasons": r["reasons"]}
            for r in ranked
        ],
        "algorithm": "Advanced AI Candidate Ranking",
        "features": ["Skill Analysis", "Experience Matching", "LLM Evaluation", "Hybrid Scoring"]
    })


@employer_bp.patch("/applications/<int:app_id>/status")
@jwt_required()
def set_status(app_id: int):
    user, e = require_role("employer", "admin")
    if e:
        return e
    app = db.session.get(Application, app_id)
    if not app:
        return err("Application not found", 404)
    job = db.session.get(Job, app.job_id)
    if user.role != "admin" and (not job or job.employer_id != user.id):
        return err("Forbidden", 403)
    data = request.get_json(silent=True) or {}
    status = (data.get("status") or "").strip()
    allowed = {"Applied", "Under Review", "Interview", "Shortlisted", "Rejected", "Selected"}
    if status not in allowed:
        return err(f"Status must be one of: {', '.join(sorted(allowed))}", 422)
    app.status = status
    db.session.commit()
    return ok({"application": app.to_dict()})
