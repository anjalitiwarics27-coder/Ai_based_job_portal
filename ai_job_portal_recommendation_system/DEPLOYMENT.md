# Deployment Guide - HireNova AI

This guide covers different ways to deploy the HireNova AI Job Portal.

## Prerequisites

- Python 3.11+
- Git
- Environment variables configured (see `.env.example`)

## Option 1: Local Deployment (Development)

```bash
# Clone the repository
git clone https://github.com/anjalitiwarics27-coder/Ai_based_job_portal.git
cd Ai_based_job_portal

# Start the application
# Windows
start.bat

# Or manually
cd backend
pip install -r requirements.txt
python app.py
```

Access at: http://localhost:5000

## Option 2: Docker Deployment (Recommended)

### Using Docker Compose

1. Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_key_here
LLM_MODEL=gpt-4o-mini
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

2. Build and run:
```bash
docker-compose up -d
```

3. Access at: http://localhost:5000

### Using Docker directly

```bash
docker build -t hirenova-ai .
docker run -p 5000:5000 \
  -v $(pwd)/backend/data:/app/backend/data \
  -v $(pwd)/backend/uploads:/app/backend/uploads \
  -e OPENAI_API_KEY=your_key \
  hirenova-ai
```

## Option 3: Render Deployment

1. Create account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
   - **Environment**: Python 3

5. Add environment variables from `.env.example`
6. Deploy

Add `gunicorn` to requirements.txt for production:
```txt
gunicorn==21.2.0
```

## Option 4: Railway Deployment

1. Create account at [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Railway will auto-detect Python
4. Add environment variables
5. Deploy

## Option 5: PythonAnywhere

1. Create account at [pythonanywhere.com](https://www.pythonanywhere.com)
2. Upload files or clone from GitHub
3. Create a new web app with Flask
4. Set source code to `/home/username/Ai_based_job_portal/backend`
5. Set WSGI file to point to your app
6. Install requirements in virtual environment
7. Configure environment variables
8. Reload web app

## Production Considerations

### Security
- Change all default secrets in production
- Use strong `SECRET_KEY` and `JWT_SECRET_KEY`
- Enable HTTPS
- Set `DEBUG=False`
- Configure proper CORS origins

### Database
- SQLite is fine for small deployments
- For production scale, consider PostgreSQL
- Set `DATABASE_URL` environment variable

### Environment Variables
Required for basic functionality:
- `SECRET_KEY`
- `JWT_SECRET_KEY`

Optional but recommended:
- `OPENAI_API_KEY` - for enhanced AI recommendations
- `SMTP_*` - for email notifications
- `RAZORPAY_*` - for payments

### File Uploads
- Ensure `uploads/` directory has write permissions
- Consider cloud storage (S3) for production

## Health Check

After deployment, verify:
```bash
curl https://your-domain.com/api/public/health
```

Should return: `{"success": true, "data": {"status": "ok", "service": "HireNova AI backend"}}`

## Support

For issues or questions, check the README or create an issue on GitHub.
