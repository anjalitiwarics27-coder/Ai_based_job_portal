"""Payments — Razorpay if keys set, else mock (deterministic, offline)."""
from __future__ import annotations

import os
import time
import hmac
import hashlib

PLANS = {
    "free": {"name": "Free", "amount_paise": 0, "features": ["1 active job", "Basic ranking"]},
    "pro": {"name": "Pro", "amount_paise": 99900, "features": ["10 active jobs", "AI ranking", "Priority support"]},
    "teams": {"name": "Teams", "amount_paise": 299900, "features": ["Unlimited jobs", "Team seats", "Dedicated manager"]},
}


def razorpay_configured() -> bool:
    return bool(os.getenv("RAZORPAY_KEY_ID")) and bool(os.getenv("RAZORPAY_KEY_SECRET"))


def create_order(amount_paise: int, plan: str = "pro"):
    if razorpay_configured():
        import razorpay

        client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))
        order = client.order.create({"amount": amount_paise, "currency": "INR", "payment_capture": 1})
        return {"provider": "razorpay", "order": order, "key_id": os.getenv("RAZORPAY_KEY_ID")}
    # Mock mode — frontend shows success instantly.
    fake_id = f"order_mock_{int(time.time()*1000)}"
    return {"provider": "mock", "order": {"id": fake_id, "amount": amount_paise, "currency": "INR"}, "key_id": "mock_key"}


def verify_payment(payload: dict) -> bool:
    if razorpay_configured():
        try:
            body = f"{payload.get('razorpay_order_id','')}|{payload.get('razorpay_payment_id','')}"
            signed = hmac.new(os.getenv("RAZORPAY_KEY_SECRET", "").encode(), body.encode(), hashlib.sha256).hexdigest()
            return hmac.compare_digest(signed, payload.get("razorpay_signature", ""))
        except Exception:
            return False
    # Mock mode (dev): accept when an order reference is present.
    return bool(payload.get("razorpay_order_id") or payload.get("order_id"))
