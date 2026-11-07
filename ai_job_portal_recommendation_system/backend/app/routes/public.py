"""Public: health, stats, contact, notifications."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..models import ContactMessage, db, Job, Notification, User
from .helpers import err, ok, paginate, require_user, validate_pagination

public_bp = Blueprint("public", __name__, url_prefix="/api/public")


@public_bp.get("/health")
def health():
    return ok({"status": "ok", "service": "HireNova AI backend"})


@public_bp.get("/stats")
def stats():
    return ok({
        "candidates": User.query.filter_by(role="candidate").count(),
        "employers": User.query.filter_by(role="employer").count(),
        "active_jobs": Job.query.filter_by(is_active=True).count(),
        "companies": db.session.query(User.company_name).filter(User.company_name.isnot(None), User.company_name != "").distinct().count(),
    })


@public_bp.post("/contact")
def contact():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()
    if not name or not email or not message:
        return err("Name, email and message are required", 422)
    row = ContactMessage(name=name, email=email, role=(data.get("role") or "candidate").strip(),
                         subject=(data.get("subject") or "").strip(), message=message)
    db.session.add(row)
    db.session.commit()
    return ok({"message": "Message received — we reply within 24h"}, 201)


@public_bp.get("/notifications")
@jwt_required()
def list_notifications():
    user, e = require_user()
    if e:
        return e
    page, per_page = validate_pagination(request.args)
    q = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc())
    items, total = paginate(q, page, per_page)
    return ok({"notifications": [n.to_dict() for n in items], "total": total, "unread": Notification.query.filter_by(user_id=user.id, is_read=False).count()})


@public_bp.patch("/notifications/<int:nid>/read")
@jwt_required()
def mark_read(nid: int):
    user, e = require_user()
    if e:
        return e
    n = db.session.get(Notification, nid)
    if not n or n.user_id != user.id:
        return err("Not found", 404)
    n.is_read = True
    db.session.commit()
    return ok({"notification": n.to_dict()})


@public_bp.post("/notifications/read-all")
@jwt_required()
def mark_all():
    user, e = require_user()
    if e:
        return e
    Notification.query.filter_by(user_id=user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return ok({"message": "All notifications marked as read"})


@public_bp.get("/ai-info")
def ai_info():
    """Information about AI Recommendation System."""
    from ..services.llm import llm_configured
    return ok({
        "name": "HireNova AI Recommendation System",
        "description": "Advanced hybrid AI recommendation engine for job matching",
        "algorithms": [
            "Content-based filtering (TF-IDF + Cosine Similarity)",
            "Skill-based matching with fuzzy logic",
            "Collaborative filtering",
            "Hybrid scoring mechanism",
            "LLM-powered intelligent recommendations (when configured)"
        ],
        "features": [
            "Explainable AI with detailed match reasons",
            "Personalized job recommendations for candidates",
            "AI-powered candidate ranking for employers",
            "Real-time matching with skill gap analysis",
            "Continuous learning from user interactions"
        ],
        "llm_enabled": llm_configured(),
        "version": "2.0.0"
    })
