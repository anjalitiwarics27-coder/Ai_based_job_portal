"""HireNova AI — Flask app factory."""
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

load_dotenv()

from config import Config, BASE_DIR  # noqa: E402
from .models import db  # noqa: E402
from .routes.auth import auth_bp  # noqa: E402
from .routes.auth2 import extras_bp  # noqa: E402
from .routes.jobs import jobs_bp  # noqa: E402
from .routes.seeker import seeker_bp  # noqa: E402
from .routes.employer import employer_bp  # noqa: E402
from .routes.admin import admin_bp  # noqa: E402
from .routes.public import public_bp  # noqa: E402

FRONTEND_DIR = (BASE_DIR.parent / "frontant").resolve()


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config:
        app.config.update(config)

    os.makedirs(BASE_DIR / "data", exist_ok=True)
    os.makedirs(app.config["UPLOAD_DIR"], exist_ok=True)

    db.init_app(app)
    JWTManager(app)
    CORS(app, origins=app.config.get("CORS_ORIGINS", ["*"]))

    app.register_blueprint(auth_bp)
    app.register_blueprint(extras_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(seeker_bp)
    app.register_blueprint(employer_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(public_bp)

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Not found"}), 404

    @app.errorhandler(401)
    def unauth(e):
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    @app.get("/")
    def root():
        idx = FRONTEND_DIR / "index.html"
        if idx.exists():
            return send_from_directory(str(FRONTEND_DIR), "index.html")
        return jsonify({"success": True, "message": "HireNova AI backend is running"})

    @app.get("/api/docs")
    def docs():
        return jsonify({
            "service": "HireNova AI API",
            "auth": ["POST /api/auth/register", "POST /api/auth/login", "POST /api/auth/refresh", "GET /api/auth/me",
                     "POST /api/auth/forgot-password", "POST /api/auth/reset-password",
                     "POST /api/auth/send-otp", "POST /api/auth/verify-otp"],
            "jobs": ["GET /api/jobs", "GET /api/jobs/<id>", "POST /api/jobs", "GET /api/jobs/recommended",
                     "POST /api/jobs/<id>/apply", "POST /api/jobs/<id>/save"],
            "seeker": ["GET /api/seeker/dashboard", "GET /api/seeker/recommendations", "GET /api/seeker/applications",
                       "POST /api/seeker/resume/analyze", "POST /api/seeker/cover-letter", "POST /api/seeker/chatbot",
                       "POST /api/seeker/interview/generate"],
            "employer": ["GET /api/employer/dashboard", "GET /api/employer/jobs/<id>/applicants",
                         "GET /api/employer/jobs/<id>/ranking"],
            "admin": ["GET /api/admin/dashboard", "GET /api/admin/users", "GET /api/admin/analytics",
                      "GET/PUT /api/admin/ai-settings", "GET /api/admin/audit"],
            "payments": ["GET /api/payments/plans", "POST /api/payments/create-checkout",
                         "POST /api/payments/verify", "GET /api/payments/history"],
            "public": ["GET /api/public/health", "GET /api/public/stats", "POST /api/public/contact"],
        })

    return app


__all__ = ["create_app"]
