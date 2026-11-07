"""Shared helpers: auth, pagination, responses."""
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity

from ..models import db, User


def ok(data, status=200):
    return jsonify({"success": True, "data": data}), status


def err(message: str, status=400, errors=None):
    body = {"success": False, "message": message}
    if errors:
        body["errors"] = errors
    return jsonify(body), status


def current_user() -> User | None:
    uid = get_jwt_identity()
    if uid is None:
        return None
    return db.session.get(User, int(uid))


def require_user():
    user = current_user()
    if not user:
        return None, err("User not found", 404)
    if user.is_suspended:
        return None, err("Account suspended", 403)
    return user, None


def require_role(*roles):
    user, e = require_user()
    if e:
        return None, e
    if user.role not in roles:
        return None, err("Forbidden for this role", 403)
    return user, None


def paginate(q, page=1, per_page=20):
    total = q.count()
    items = q.offset((page - 1) * per_page).limit(per_page).all()
    return items, total


def validate_pagination(args):
    try:
        page = max(1, int(args.get("page", 1)))
        per_page = min(100, max(1, int(args.get("per_page", 20))))
    except ValueError:
        page, per_page = 1, 20
    return page, per_page
