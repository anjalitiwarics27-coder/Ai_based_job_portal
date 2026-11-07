"""Auth: register / login / refresh / me / forgot / reset / change password."""
from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe

from flask import Blueprint, request
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                get_jwt_identity, jwt_required)

from ..models import PasswordReset, db, User
from ..services.emailer import send_reset_email
from .helpers import current_user, err, ok, require_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


def _tokens(user: User):
    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return {"access_token": access, "refresh_token": refresh, "token_type": "Bearer"}


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    import re

    if not re.match(EMAIL_RE, email):
        return err("Enter a valid email address", 422)
    password = data.get("password") or ""
    if len(password) < 8:
        return err("Password must be at least 8 characters", 422)
    role = (data.get("role") or "candidate").strip().lower()
    if role not in ("candidate", "employer"):
        return err("Role must be candidate or employer", 422)
    if User.query.filter_by(email=email).first():
        return err("Account already exists for this email", 409)

    user = User(
        email=email,
        role=role,
        first_name=(data.get("first_name") or "").strip(),
        last_name=(data.get("last_name") or "").strip(),
        company_name=(data.get("company_name") or "").strip() if role == "employer" else "",
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return ok({"user": user.to_dict(), **_tokens(user)}, 201)


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(data.get("password") or ""):
        return err("Invalid email or password", 401)
    if user.is_suspended:
        return err("Account suspended — contact support", 403)
    return ok({"user": user.to_dict(), **_tokens(user)})


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user, e = require_user()
    if e:
        return e
    return ok(_tokens(user))


@auth_bp.get("/me")
@jwt_required()
def me():
    user, e = require_user()
    if e:
        return e
    return ok({"user": user.to_dict()})


@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    user = User.query.filter_by(email=email).first()
    # always 200 to avoid email enumeration
    if user:
        token = token_urlsafe(32)
        row = PasswordReset(
            user_id=user.id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
        )
        db.session.add(row)
        db.session.commit()
        # Email if SMTP configured, else include dev token for local testing.
        import os
        base = os.getenv("APP_URL", "http://127.0.0.1:5000")
        sent = send_reset_email(user.email, f"{base}/forget_password.html?token={token}")
        if sent:
            return ok({"message": "If that email exists, a reset link was sent."})
        return ok({"message": "If that email exists, a reset link was sent.", "dev_reset_token": token})
    return ok({"message": "If that email exists, a reset link was sent."})


@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()
    password = data.get("password") or ""
    if len(password) < 8:
        return err("Password must be at least 8 characters", 422)
    row = PasswordReset.query.filter_by(token=token).first()
    if not row or row.used:
        return err("Invalid or expired reset token", 400)
    # naive expiry compare (sqlite stores naive utc)
    exp = row.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        return err("Reset link expired", 400)
    user = db.session.get(User, row.user_id)
    user.set_password(password)
    row.used = True
    db.session.commit()
    return ok({"message": "Password reset successfully"})


@auth_bp.post("/change-password")
@jwt_required()
def change_password():
    user, e = require_user()
    if e:
        return e
    data = request.get_json(silent=True) or {}
    if not user.check_password(data.get("current_password") or ""):
        return err("Current password is incorrect", 401)
    new = data.get("new_password") or ""
    if len(new) < 8:
        return err("New password must be at least 8 characters", 422)
    user.set_password(new)
    db.session.commit()
    return ok({"message": "Password changed"})
