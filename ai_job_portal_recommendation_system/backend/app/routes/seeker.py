"""Candidate workspace: profile, applications, saved, resume, cover letter, chatbot, interview."""
import os
import tempfile

from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from ..models import Application, db, Notification, ResumeAnalysis, SavedJob
from ..services.ai_helpers import generate_cover_letter, chatbot_reply, interview_questions
from ..services.llm import llm_chat_reply, llm_cover_letter, llm_interview_questions
from ..services.matcher import ai_recommend_jobs as recommend_jobs
from ..services.resume_parser import analyze_resume_text, extract_text
from .helpers import err, ok, paginate, require_role, require_user, validate_pagination
from ..models import Job

seeker_bp = Blueprint("seeker", __name__, url_prefix="/api/seeker")


@seeker_bp.get("/profile")
@jwt_required()
def get_profile():
    user, e = require_user()
    if e:
        return e
    return ok({"profile": user.to_dict()})


@seeker_bp.put("/profile")
@jwt_required()
def update_profile():
    user, e = require_user()
    if e:
        return e
    data = request.get_json(silent=True) or {}
    for field in ("first_name", "last_name", "headline", "location", "phone", "experience", "bio"):
        if field in data:
            setattr(user, field, (data[field] or "").strip())
    if "skills" in data:
        s = data["skills"]
        user.skills = ", ".join([str(x).strip() for x in s if str(x).strip()]) if isinstance(s, list) else str(s)
    db.session.commit()
    return ok({"profile": user.to_dict()})


@seeker_bp.get("/dashboard")
@jwt_required()
def dashboard():
    user, e = require_role("candidate")
    if e:
        return e
    jobs = Job.query.filter_by(is_active=True).all()
    ranked = recommend_jobs(user, jobs, top_n=4)
    apps = Application.query.filter_by(candidate_id=user.id).order_by(Application.created_at.desc()).limit(5).all()
    saved = SavedJob.query.filter_by(user_id=user.id).order_by(SavedJob.created_at.desc()).limit(5).all()
    notifs = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    resume = ResumeAnalysis.query.filter_by(user_id=user.id).order_by(ResumeAnalysis.created_at.desc()).first()
    return ok({
        "user": user.to_dict(),
        "stats": {
            "available_jobs": Job.query.filter_by(is_active=True).count(),
            "applications": Application.query.filter_by(candidate_id=user.id).count(),
            "saved_jobs": SavedJob.query.filter_by(user_id=user.id).count(),
            "resume_score": resume.score if resume else 0,
            "unread_notifications": notifs,
        },
        "recommendations": [
            {"job": r["job"].to_dict(), "match_score": r["score"], "reasons": r["reasons"]} for r in ranked
        ],
        "recent_applications": [a.to_dict() for a in apps],
        "saved_jobs": [
            {"saved_id": s.id, "job": db.session.get(Job, s.job_id).to_dict() if db.session.get(Job, s.job_id) else None}
            for s in saved
        ],
    })


@seeker_bp.get("/recommendations")
@jwt_required()
def recommendations():
    user, e = require_role("candidate")
    if e:
        return e
    top_n = int(request.args.get("limit", 10))
    jobs = Job.query.filter_by(is_active=True).all()
    ranked = recommend_jobs(user, jobs, top_n=top_n)
    return ok({
        "recommendations": [
            {"job": r["job"].to_dict(), "match_score": r["score"], "reasons": r["reasons"]} for r in ranked
        ],
        "algorithm": "AI-Hybrid (TF-IDF + Skill-Matching + Collaborative Filtering + LLM)"
    })


@seeker_bp.get("/ai/recommendations")
@jwt_required()
def ai_recommendations():
    """Advanced AI-powered job recommendations endpoint."""
    user, e = require_role("candidate")
    if e:
        return e
    top_n = int(request.args.get("limit", 15))
    jobs = Job.query.filter_by(is_active=True).all()
    from ..services.matcher import ai_recommend_jobs
    ranked = ai_recommend_jobs(user, jobs, top_n=top_n)
    return ok({
        "recommendations": [
            {"job": r["job"].to_dict(), "match_score": r["score"], "reasons": r["reasons"]} for r in ranked
        ],
        "algorithm": "Advanced AI Recommendation System",
        "features": ["Content-based filtering", "Collaborative filtering", "LLM enhancement", "Explainable AI"]
    })


@seeker_bp.get("/applications")
@jwt_required()
def list_applications():
    user, e = require_user()
    if e:
        return e
    page, per_page = validate_pagination(request.args)
    q = Application.query.filter_by(candidate_id=user.id).order_by(Application.created_at.desc())
    items, total = paginate(q, page, per_page)
    return ok({"applications": [a.to_dict() for a in items], "total": total, "page": page, "per_page": per_page})


@seeker_bp.delete("/applications/<int:app_id>")
@jwt_required()
def withdraw_application(app_id: int):
    user, e = require_user()
    if e:
        return e
    app = db.session.get(Application, app_id)
    if not app or app.candidate_id != user.id:
        return err("Application not found", 404)
    db.session.delete(app)
    db.session.commit()
    return ok({"message": "Application withdrawn"})


@seeker_bp.get("/saved")
@jwt_required()
def list_saved():
    user, e = require_user()
    if e:
        return e
    rows = SavedJob.query.filter_by(user_id=user.id).order_by(SavedJob.created_at.desc()).all()
    out = []
    for s in rows:
        job = db.session.get(Job, s.job_id)
        if job:
            out.append({"id": s.id, "job": job.to_dict(), "created_at": s.created_at.isoformat()})
    return ok({"saved": out})


@seeker_bp.post("/resume/analyze")
@jwt_required()
def analyze_resume():
    user, e = require_user()
    if e:
        return e
    upload = request.files.get("file")
    if upload and upload.filename:
        ext = os.path.splitext(upload.filename)[1].lower()
        if ext not in (".pdf", ".docx", ".txt"):
            return err("Upload a PDF, DOCX or TXT file", 422)
        safe = secure_filename(upload.filename)
        os.makedirs(current_app.config["UPLOAD_DIR"], exist_ok=True)
        path = os.path.join(str(current_app.config["UPLOAD_DIR"]), f"u{user.id}_{safe}")
        upload.save(path)
        try:
            text = extract_text(path)
        except ValueError as ve:
            return err(str(ve), 422)
    else:
        data = request.get_json(silent=True) or {}
        text = (data.get("text") or data.get("resume_text") or "").strip()
        safe = "pasted.txt"
        if len(text) < 50:
            return err("Resume text is too short — paste your resume or upload a file", 422)
    result = analyze_resume_text(text)
    row = ResumeAnalysis(
        user_id=user.id,
        filename=safe,
        parsed_text=text[:20000],
        extracted_skills=", ".join(result["skills"]),
        score=result["score"],
        feedback=result["feedback"].__str__(),
    )
    db.session.add(row)
    db.session.commit()
    return ok({"filename": safe, **result}, 201)


@seeker_bp.get("/resume/latest")
@jwt_required()
def latest_resume():
    user, e = require_user()
    if e:
        return e
    row = ResumeAnalysis.query.filter_by(user_id=user.id).order_by(ResumeAnalysis.created_at.desc()).first()
    if not row:
        return ok({"resume": None})
    return ok({
        "resume": {
            "id": row.id,
            "filename": row.filename,
            "skills": [s.strip() for s in (row.extracted_skills or "").split(",") if s.strip()],
            "score": row.score,
            "feedback": row.feedback,
            "created_at": row.created_at.isoformat(),
        }
    })


@seeker_bp.post("/cover-letter")
@jwt_required()
def cover_letter():
    user, e = require_user()
    if e:
        return e
    data = request.get_json(silent=True) or {}
    job_id = data.get("job_id")
    if not job_id:
        return err("job_id is required", 422)
    job = db.session.get(Job, int(job_id))
    if not job:
        return err("Job not found", 404)
    letter = llm_cover_letter(user, job) or generate_cover_letter(user, job)
    return ok({"job": job.to_dict(), "cover_letter": letter, "via": "llm" if llm_cover_letter else "template"})


@seeker_bp.post("/chatbot")
@jwt_required()
def chatbot():
    user, e = require_user()
    if e:
        return e
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return err("message is required", 422)
    reply = llm_chat_reply(message, user=user, history=data.get("history")) or chatbot_reply(
        message, user=user, history=data.get("history"))
    return ok({"reply": reply})


@seeker_bp.post("/interview/generate")
@jwt_required()
def interview_generate():
    user, e = require_user()
    if e:
        return e
    data = request.get_json(silent=True) or {}
    topic = (data.get("topic") or "default").strip()
    count = min(10, max(1, int(data.get("count", 5))))
    qs = llm_interview_questions(topic, count) or interview_questions(topic, count)
    return ok({"topic": topic, "questions": qs})
