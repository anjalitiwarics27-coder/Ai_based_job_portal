"""HireNova AI — SQLAlchemy models (SQLite)."""
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
import bcrypt

db = SQLAlchemy()


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="candidate")  # candidate | employer | admin
    first_name = db.Column(db.String(100), default="")
    last_name = db.Column(db.String(100), default="")
    headline = db.Column(db.String(255), default="")
    location = db.Column(db.String(120), default="")
    phone = db.Column(db.String(30), default="")
    skills = db.Column(db.Text, default="")  # comma-separated
    experience = db.Column(db.String(120), default="")
    bio = db.Column(db.Text, default="")
    company_name = db.Column(db.String(255), default="")
    is_verified = db.Column(db.Boolean, default=True)
    is_suspended = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    # relationships
    jobs_posted = db.relationship("Job", backref="employer", foreign_keys="Job.employer_id", lazy="dynamic")
    applications = db.relationship("Application", backref="applicant", foreign_keys="Application.candidate_id", lazy="dynamic")
    saved = db.relationship("SavedJob", backref="user", lazy="dynamic")
    notifications = db.relationship("Notification", backref="user", lazy="dynamic")

    def set_password(self, pw: str):
        self.password_hash = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

    def check_password(self, pw: str) -> bool:
        return bcrypt.checkpw(pw.encode(), self.password_hash.encode())

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def to_dict(self, include_skills=True):
        d = {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "headline": self.headline,
            "location": self.location,
            "phone": self.phone,
            "experience": self.experience,
            "bio": self.bio,
            "company_name": self.company_name,
            "is_verified": self.is_verified,
            "is_suspended": self.is_suspended,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_skills:
            d["skills"] = [s.strip() for s in (self.skills or "").split(",") if s.strip()]
        return d


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(120), default="Remote")
    job_type = db.Column(db.String(50), default="Full-time")
    salary = db.Column(db.String(120), default="")
    experience = db.Column(db.String(120), default="")
    skills = db.Column(db.Text, default="")  # comma-separated
    description = db.Column(db.Text, default="")
    category = db.Column(db.String(120), default="General")
    employer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    applications = db.relationship("Application", backref="job", lazy="dynamic")

    @property
    def skills_list(self):
        return [s.strip() for s in (self.skills or "").split(",") if s.strip()]

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "job_type": self.job_type,
            "salary": self.salary,
            "experience": self.experience,
            "skills": self.skills_list,
            "description": self.description,
            "category": self.category,
            "employer_id": self.employer_id,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    status = db.Column(db.String(30), default="Applied")  # Applied | Under Review | Interview | Shortlisted | Rejected | Selected
    cover_letter = db.Column(db.Text, default="")
    match_score = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        job = self.job
        return {
            "id": self.id,
            "job_id": self.job_id,
            "status": self.status,
            "cover_letter": self.cover_letter,
            "match_score": self.match_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "job": job.to_dict() if job else None,
        }


class SavedJob(db.Model):
    __tablename__ = "saved_jobs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    __table_args__ = (db.UniqueConstraint("user_id", "job_id", name="uq_saved_user_job"),)


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, default="")
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ResumeAnalysis(db.Model):
    __tablename__ = "resume_analyses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    filename = db.Column(db.String(255), default="")
    parsed_text = db.Column(db.Text, default="")
    extracted_skills = db.Column(db.Text, default="")  # comma-separated
    score = db.Column(db.Integer, default=0)
    feedback = db.Column(db.Text, default="")  # JSON string
    created_at = db.Column(db.DateTime, default=utcnow)


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    action = db.Column(db.String(120), nullable=False)
    detail = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=utcnow)


class ContactMessage(db.Model):
    __tablename__ = "contact_messages"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default="candidate")
    subject = db.Column(db.String(255), default="")
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)


class PasswordReset(db.Model):
    __tablename__ = "password_resets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)


class OtpCode(db.Model):
    __tablename__ = "otp_codes"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, index=True)
    otp_hash = db.Column(db.String(255), nullable=False)  # sha256
    purpose = db.Column(db.String(30), default="verify")  # verify | reset
    expires_at = db.Column(db.DateTime, nullable=False)
    attempts = db.Column(db.Integer, default=0)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plan = db.Column(db.String(30), default="pro")
    amount_paise = db.Column(db.Integer, default=0)
    provider = db.Column(db.String(30), default="mock")
    order_id = db.Column(db.String(255), default="")
    payment_id = db.Column(db.String(255), default="")
    status = db.Column(db.String(30), default="created")  # created | paid | failed
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "plan": self.plan, "amount_paise": self.amount_paise,
            "provider": self.provider, "order_id": self.order_id,
            "payment_id": self.payment_id, "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AISettings(db.Model):
    __tablename__ = "ai_settings"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(120), unique=True, nullable=False)
    value = db.Column(db.Text, default="")
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {"key": self.key, "value": self.value}
