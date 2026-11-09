# HireNova AI - production container
FROM python:3.11-slim

WORKDIR /app

# System dependencies (gcc for some wheels/builds, curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY backend/ ./backend/
COPY frontant/ ./frontant/

RUN mkdir -p /app/backend/data /app/backend/uploads

WORKDIR /app/backend

EXPOSE 5000

ENV FLASK_APP=app.py
ENV PYTHONPATH=/app/backend
ENV DEBUG=False
ENV HOST=0.0.0.0
ENV PORT=5000

# Gunicorn serves the Flask app; tables/demo data are auto-initialized on startup.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "--timeout", "120", "app:app"]
