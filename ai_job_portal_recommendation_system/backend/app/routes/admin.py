"""Admin: moderation + analytics + audit."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..models import AISettings, Application, AuditLog, db, Job, User
from .helpers import err, ok, paginate, require_role, validate_pagination

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _audit(actor_id, action, detail=""):
    db.session.add(AuditLog(actor_id=actor_id, action=action, detail=detail))


@admin_bp.get("/dashboard")
@jwt_required()
def dashboard():
    admin, e = require_role("admin")
    if e:
        return e
    return ok({
        "stats": {
            "users": User.query.count(),
            "candidates": User.query.filter_by(role="candidate").count(),
            "employers": User.query.filter_by(role="employer").count(),
            "jobs": Job.query.filter_by(is_active=True).count(),
            "applications": Application.query.count(),
            "flagged": User.query.filter_by(is_suspended=True).count(),
        },
    })


@admin_bp.get("/users")
@jwt_required()
def list_users():
    admin, e = require_role("admin")
    if e:
        return e
    q = User.query.order_by(User.created_at.desc())
    role = (request.args.get("role") or "").strip()
    if role:
        q = q.filter_by(role=role)
    page, per_page = validate_pagination(request.args)
    items, total = paginate(q, page, per_page)
    return ok({"users": [u.to_dict() for u in items], "total": total, "page": page, "per_page": per_page})


@admin_bp.patch("/users/<int:user_id>/verify")
@jwt_required()
def verify_user(user_id: int):
    admin, e = require_role("admin")
    if e:
        return e
    user = db.session.get(User, user_id)
    if not user:
        return err("User not found", 404)
    user.is_verified = not user.is_verified
    _audit(admin.id, "toggle_verify", f"user {user_id} -> verified={user.is_verified}")
    db.session.commit()
    return ok({"user": user.to_dict()})


@admin_bp.patch("/users/<int:user_id>/suspend")
@jwt_required()
def suspend_user(user_id: int):
    admin, e = require_role("admin")
    if e:
        return e
    user = db.session.get(User, user_id)
    if not user:
        return err("User not found", 404)
    user.is_suspended = not user.is_suspended
    _audit(admin.id, "toggle_suspend", f"user {user_id} -> suspended={user.is_suspended}")
    db.session.commit()
    return ok({"user": user.to_dict()})


@admin_bp.get("/jobs")
@jwt_required()
def list_jobs():
    admin, e = require_role("admin")
    if e:
        return e
    q = Job.query.order_by(Job.created_at.desc())
    page, per_page = validate_pagination(request.args)
    items, total = paginate(q, page, per_page)
    return ok({"jobs": [j.to_dict() for j in items], "total": total, "page": page, "per_page": per_page})


@admin_bp.get("/analytics")
@jwt_required()
def analytics():
    admin, e = require_role("admin")
    if e:
        return e
    by_status = {}
    for (status, count) in db.session.query(Application.status, db.func.count(Application.id)).group_by(Application.status):
        by_status[status] = count
    by_category = {}
    for (cat, count) in db.session.query(Job.category, db.func.count(Job.id)).group_by(Job.category):
        by_category[cat or "General"] = count
    return ok({
        "applications_by_status": by_status,
        "jobs_by_category": by_category,
        "totals": {
            "users": User.query.count(),
            "jobs": Job.query.count(),
            "applications": Application.query.count(),
        },
    })


@admin_bp.get("/audit")
@jwt_required()
def audit():
    admin, e = require_role("admin")
    if e:
        return e
    page, per_page = validate_pagination(request.args)
    q = AuditLog.query.order_by(AuditLog.created_at.desc())
    items, total = paginate(q, page, per_page)
    def d(a):
        return {"id": a.id, "actor_id": a.actor_id, "action": a.action, "detail": a.detail,
                "created_at": a.created_at.isoformat() if a.created_at else None}
    return ok({"logs": [d(a) for a in items], "total": total, "page": page, "per_page": per_page})


@admin_bp.get("/ai-settings")
@jwt_required()
def list_ai_settings():
    admin, e = require_role("admin")
    if e:
        return e
    rows = AISettings.query.order_by(AISettings.key).all()
    return ok({"settings": [r.to_dict() for r in rows]})


@admin_bp.put("/ai-settings")
@jwt_required()
def update_ai_settings():
    admin, e = require_role("admin")
    if e:
        return e
    data = request.get_json(silent=True) or {}
    if "key" not in data or "value" not in data:
        return err("key and value are required", 422)
    key = str(data["key"]).strip()[:120]
    value = str(data["value"])[:5000]
    row = AISettings.query.filter_by(key=key).first()
    if row:
        row.value = value
    else:
        db.session.add(AISettings(key=key, value=value))
    _audit(admin.id, "ai_settings_update", f"{key}={value[:100]}")
    db.session.commit()
    row = AISettings.query.filter_by(key=key).first()
    return ok({"setting": row.to_dict()})
