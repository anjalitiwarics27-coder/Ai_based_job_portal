"""Jobs: public search/browse + apply + save (candidate) + CRUD (employer/admin)."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError

from ..models import Application, Job, SavedJob, User, db
from ..services.matcher import ai_recommend_jobs as recommend_jobs
from .helpers import err, ok, paginate, parse_int, require_role, require_user, validate_pagination

jobs_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")

ALLOWED_SORT = {"newest", "match", "title"}


def _filtered_query(args):
    q = Job.query.filter_by(is_active=True)
    q_str = (args.get("q") or args.get("search") or "").strip()
    loc = (args.get("location") or "").strip()
    job_type = (args.get("job_type") or args.get("type") or "").strip()
    category = (args.get("category") or "").strip()
    if q_str:
        like = f"%{q_str}%"
        q = q.filter(
            db.or_(
                Job.title.ilike(like),
                Job.company.ilike(like),
                Job.skills.ilike(like),
                Job.description.ilike(like),
            )
        )
    if loc:
        q = q.filter(Job.location.ilike(f"%{loc}%"))
    if job_type:
        q = q.filter(Job.job_type.ilike(f"%{job_type}%"))
    if category:
        q = q.filter(Job.category.ilike(f"%{category}%"))
    return q


@jobs_bp.get("")
def list_jobs():
    page, per_page = validate_pagination(request.args)
    q = _filtered_query(request.args)
    sort = (request.args.get("sort") or "newest").lower()
    if sort == "title":
        q = q.order_by(Job.title.asc())
    else:
        q = q.order_by(Job.created_at.desc())
    items, total = paginate(q, page, per_page)
    return ok({"jobs": [j.to_dict() for j in items], "total": total, "page": page, "per_page": per_page})


@jobs_bp.get("/<int:job_id>")
def get_job(job_id: int):
    job = db.session.get(Job, job_id)
    if not job:
        return err("Job not found", 404)
    return ok({"job": job.to_dict()})


@jobs_bp.post("")
@jwt_required()
def create_job():
    user, e = require_role("employer", "admin")
    if e:
        return e
    data = request.get_json(silent=True) or {}
    if not (data.get("title") or "").strip():
        return err("Job title is required", 422)
    if not (data.get("company") or "").strip():
        # employers can just use company_name
        data["company"] = user.company_name or user.full_name
    skills = data.get("skills") or []
    if isinstance(skills, list):
        skills = ", ".join([str(s).strip() for s in skills if str(s).strip()])
    job = Job(
        title=data["title"].strip(),
        company=data["company"].strip(),
        location=(data.get("location") or "Remote").strip(),
        job_type=(data.get("job_type") or "Full-time").strip(),
        salary=(data.get("salary") or "").strip(),
        experience=(data.get("experience") or "").strip(),
        skills=skills,
        description=(data.get("description") or "").strip(),
        category=(data.get("category") or "General").strip(),
        employer_id=user.id,
        is_active=True,
    )
    db.session.add(job)
    db.session.commit()
    return ok({"job": job.to_dict()}, 201)


@jobs_bp.put("/<int:job_id>")
@jwt_required()
def update_job(job_id: int):
    owner, e = require_role("employer", "admin")
    if e:
        return e
    job = db.session.get(Job, job_id)
    if not job:
        return err("Job not found", 404)
    if owner.role != "admin" and job.employer_id != owner.id:
        return err("Forbidden", 403)
    data = request.get_json(silent=True) or {}
    if "title" in data:
        job.title = (data["title"] or "").strip()
    if "company" in data:
        job.company = (data["company"] or "").strip()
    if "location" in data:
        job.location = (data["location"] or "").strip()
    if "job_type" in data:
        job.job_type = (data["job_type"] or "").strip()
    if "salary" in data:
        job.salary = (data["salary"] or "").strip()
    if "experience" in data:
        job.experience = (data["experience"] or "").strip()
    if "skills" in data:
        s = data["skills"]
        job.skills = ", ".join([str(x).strip() for x in s if str(x).strip()]) if isinstance(s, list) else str(s)
    if "description" in data:
        job.description = (data["description"] or "").strip()
    if "category" in data:
        job.category = (data["category"] or "").strip()
    if "is_active" in data:
        job.is_active = bool(data["is_active"])
    db.session.commit()
    return ok({"job": job.to_dict()})


@jobs_bp.delete("/<int:job_id>")
@jwt_required()
def delete_job(job_id: int):
    owner, e = require_role("employer", "admin")
    if e:
        return e
    job = db.session.get(Job, job_id)
    if not job:
        return err("Job not found", 404)
    if owner.role != "admin" and job.employer_id != owner.id:
        return err("Forbidden", 403)
    job.is_active = False  # soft delete
    db.session.commit()
    return ok({"message": "Job archived"})


@jobs_bp.post("/<int:job_id>/apply")
@jwt_required()
def apply_job(job_id: int):
    user, e = require_role("candidate")
    if e:
        return e
    job = db.session.get(Job, job_id)
    if not job or not job.is_active:
        return err("Job not found", 404)
    existing = Application.query.filter_by(candidate_id=user.id, job_id=job.id).first()
    if existing:
        return err("You have already applied to this job", 409)
    data = request.get_json(silent=True) or {}
    app = Application(candidate_id=user.id, job_id=job.id,
                      cover_letter=(data.get("cover_letter") or "").strip())
    db.session.add(app)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return err("You have already applied to this job", 409)
    return ok({"application": app.to_dict()}, 201)


@jobs_bp.post("/<int:job_id>/save")
@jwt_required()
def save_job(job_id: int):
    user, e = require_user()
    if e:
        return e
    job = db.session.get(Job, job_id)
    if not job:
        return err("Job not found", 404)
    if SavedJob.query.filter_by(user_id=user.id, job_id=job.id).first():
        return ok({"message": "Already saved"})
    db.session.add(SavedJob(user_id=user.id, job_id=job.id))
    db.session.commit()
    return ok({"message": "Job saved"}, 201)


@jobs_bp.delete("/<int:job_id>/save")
@jwt_required()
def unsave_job(job_id: int):
    user, e = require_user()
    if e:
        return e
    row = SavedJob.query.filter_by(user_id=user.id, job_id=job_id).first()
    if not row:
        return err("Not saved", 404)
    db.session.delete(row)
    db.session.commit()
    return ok({"message": "Removed from saved"})


@jobs_bp.get("/recommended")
@jwt_required(optional=True)
def recommended():
    """AI ranked jobs for the logged-in candidate (or sample profile)."""
    from flask_jwt_extended import get_jwt_identity

    user = None
    uid = get_jwt_identity()
    if uid:
        user = db.session.get(User, int(uid))
    jobs = Job.query.filter_by(is_active=True).all()
    top_n = parse_int(request.args.get("limit"), default=10, min_v=1, max_v=50)
    if top_n is None:
        return err("limit must be an integer", 422)
    if user:
        all_users = User.query.filter_by(role="candidate").all()
        all_apps = Application.query.all()
        ranked = recommend_jobs(user, jobs, top_n=top_n, all_users=all_users, all_applications=all_apps)
        return ok({
            "recommendations": [
                {"job": r["job"].to_dict(), "match_score": r["score"], "reasons": r["reasons"]}
                for r in ranked
            ]
        })
    # anonymous: top jobs by recency
    jobs = sorted(jobs, key=lambda j: j.created_at or j.id, reverse=True)[:top_n]
    return ok({"recommendations": [{"job": j.to_dict(), "match_score": None, "reasons": []} for j in jobs]})
