"""Email helper — SMTP if configured, otherwise dev-log fallback (no key needed to run)."""
from __future__ import annotations

import os
import smtplib
from email.message import EmailMessage


def _smtp_cfg():
    return {
        "host": os.getenv("SMTP_HOST", ""),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", ""),
        "pass": os.getenv("SMTP_PASS", ""),
        "from": os.getenv("MAIL_FROM", "HireNova AI <no-reply@hirenova.ai>"),
        "use_tls": os.getenv("SMTP_TLS", "true").lower() == "true",
    }


def smtp_configured() -> bool:
    return bool(_smtp_cfg()["host"])


def send_email(to: str, subject: str, body: str) -> bool:
    cfg = _smtp_cfg()
    if not cfg["host"]:
        print(f"[DEV EMAIL TO {to}] {subject}\n{body}\n---")
        return False
    try:
        msg = EmailMessage()
        msg["From"] = cfg["from"]
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)
        with smtplib.SMTP(cfg["host"], cfg["port"], timeout=15) as s:
            if cfg["use_tls"]:
                s.starttls()
            if cfg["user"]:
                s.login(cfg["user"], cfg["pass"])
            s.send_message(msg)
        return True
    except Exception as e:  # pragma: no cover
        print(f"Email failed: {e}")
        # never crash request flow
        return False


def send_otp_email(to: str, otp: str, purpose: str = "verify") -> bool:
    subject = "Your HireNova AI OTP"
    body = f"Your HireNova AI OTP is: {otp}\nValid for 10 minutes. If you did not request this, ignore it."
    return send_email(to, subject, body)


def send_reset_email(to: str, reset_url: str) -> bool:
    subject = "Reset your HireNova AI password"
    body = f"Click to reset your password (30 min): {reset_url}\nIf you did not request this, ignore."
    return send_email(to, subject, body)
