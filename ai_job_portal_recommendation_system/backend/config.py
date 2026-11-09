import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
# data/app.db sqlite
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'data' / 'app.db'}",
)


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "hirenova-dev-secret-change-in-prod")
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "hirenova-jwt-secret-change-in-prod")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400))  # 24h
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000))  # 30d
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB upload limit
    UPLOAD_DIR = BASE_DIR / "uploads"
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    DEBUG = os.getenv("DEBUG", "false").lower() in ("1", "true", "yes")
    AUTO_INIT_DB = os.getenv("AUTO_INIT_DB", "true").lower() in ("1", "true", "yes")
