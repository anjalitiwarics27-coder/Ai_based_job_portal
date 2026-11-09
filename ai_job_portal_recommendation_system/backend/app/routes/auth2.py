"""OTP + payments + misc extras (kept separate so auth.py stays clean)."""
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from secrets import randbelow

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..models import db, OtpCode, Payment
from ..services.emailer import send_otp_email
from ..services.payments import PLANS, create_order, verify_payment
from .helpers import err, ok, require_user

extras_bp = Blueprint("extras", __name__, url_prefix="/api")


def _hash_otp(otp: str) -> str:
    return sha256(otp.encode()).hexdigest()


def _new_otp() -> str:
    return f"{randbelow(900000) + 100000:06d}"


@extras_bp.post("/auth/send-otp")
def send_otp():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    import re
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return err("Enter a valid email", 422)
    otp = _new_otp()
    db.session.add(OtpCode(
        email=email, otp_hash=_hash_otp(otp), purpose=(data.get("purpose") or "verify").strip(),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    ))
    db.session.commit()
    send_otp_email(email, otp)
    # Dev mode: return OTP so local testing works without SMTP.
    return ok({"message": "OTP sent", "dev_otp": otp, "dev_hint": "Use dev_otp in local dev"})


@extras_bp.post("/auth/verify-otp")
def verify_otp():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    otp = (data.get("otp") or "").strip()
    purpose = (data.get("purpose") or "verify").strip()
    row = (OtpCode.query.filter_by(email=email, purpose=purpose, used=False)
           .order_by(OtpCode.created_at.desc()).first())
    if not row:
        return err("OTP not found", 404)
    exp = row.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        return err("OTP expired", 400)
    if row.attempts >= 5:
        return err("Too many attempts — request a new OTP", 429)
    if row.otp_hash != _hash_otp(otp):
        row.attempts += 1
        db.session.commit()
        return err("Invalid OTP", 401)
    row.used = True
    db.session.commit()
    return ok({"message": "Email verified"})


@extras_bp.get("/payments/plans")
def plans():
    return ok({"plans": {k: {"name": v["name"], "amount_paise": v["amount_paise"],
                             "amount_inr": round(v["amount_paise"] / 100, 2), "features": v["features"]}
                        for k, v in PLANS.items()}})


@extras_bp.post("/payments/create-checkout")
@jwt_required()
def checkout():
    user, e = require_user()
    if e:
        return e
    data = request.get_json(silent=True) or {}
    plan = (data.get("plan") or "pro").strip().lower()
    if plan not in PLANS:
        return err("Unknown plan", 422)
    amount = PLANS[plan]["amount_paise"]
    result = create_order(amount, plan)
    row = Payment(user_id=user.id, plan=plan, amount_paise=amount,
                  provider=result["provider"], order_id=result["order"].get("id", ""), status="created")
    db.session.add(row)
    db.session.commit()
    return ok({"plan": plan, "payment": row.to_dict(), "checkout": result}, 201)


@extras_bp.post("/payments/verify")
@jwt_required()
def verify():
    user, e = require_user()
    if e:
        return e
    data = request.get_json(silent=True) or {}
    order_id = (data.get("razorpay_order_id") or data.get("order_id") or "").strip()
    if not order_id:
        return err("order_id is required", 422)
    row = Payment.query.filter_by(user_id=user.id, order_id=order_id).first()
    if not row:
        return err("Payment record not found", 404)
    ok_flag = verify_payment({**data, "order_id": order_id, "razorpay_order_id": data.get("razorpay_order_id") or order_id})
    row.payment_id = (data.get("razorpay_payment_id") or data.get("payment_id") or "").strip()
    row.status = "paid" if ok_flag else "failed"
    if ok_flag and user.role == "employer":
        user.company_name = user.company_name or user.full_name
    db.session.commit()
    if not ok_flag:
        return err("Payment verification failed", 400)
    return ok({"payment": row.to_dict(), "message": "Payment verified"})


@extras_bp.get("/payments/history")
@jwt_required()
def history():
    user, e = require_user()
    if e:
        return e
    rows = Payment.query.filter_by(user_id=user.id).order_by(Payment.created_at.desc()).all()
    return ok({"payments": [p.to_dict() for p in rows]})
