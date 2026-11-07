# HireNova AI - Multi-stage Docker build
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ ./backend/
COPY frontant/ ./frontant/

# Create necessary directories
RUN mkdir -p /app/backend/data /app/backend/uploads

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV PYTHONPATH=/app/backend

# Run the application
CMD ["python", "app.py"]
