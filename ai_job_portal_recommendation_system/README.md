# HireNova AI - Job Portal with AI Recommendations

HireNova AI is an intelligent job portal system that leverages AI-powered recommendation engines to connect job seekers with relevant opportunities. It features role-based dashboards, resume analysis, AI-powered job matching, and comprehensive application management.

## 🚀 Features

### For Job Seekers (Candidates)
- **AI-Powered Job Recommendations** - Get personalized job matches using TF-IDF and LLM-enhanced recommendations
- **Smart Job Search** - Filter by location, job type, category, and keywords
- **Resume Analysis & ATS Scoring** - Upload PDF/DOCX/TXT resumes for instant ATS compatibility scoring
- **AI Cover Letter Generator** - Generate tailored cover letters using AI
- **AI Career Chatbot** - Get career advice and job search assistance
- **Interview Preparation** - AI-generated interview questions based on job role
- **Application Tracking** - Manage all job applications in one place
- **Save Jobs** - Bookmark interesting opportunities

### For Employers
- **Job Post Management** - Create, update, and manage job postings
- **AI Candidate Ranking** - Get AI-powered candidate recommendations for each job posting
- **Applicant Tracking** - Review and manage applications with status updates
- **Dashboard Analytics** - Track job performance and applicant metrics

### For Admins
- **User Management** - Manage all users across the platform
- **Job Moderation** - Oversee all job postings
- **Analytics Dashboard** - Platform-wide statistics and insights
- **Audit Logs** - Track system activities
- **AI Settings** - Configure AI features

### AI & Machine Learning
- **Hybrid Recommendation Engine** - Combines TF-IDF cosine similarity with LLM for intelligent matching
- **Explainable AI** - Provides clear reasons for each recommendation
- **Resume Parsing** - Extracts skills and information from resumes
- **ATS Scoring** - Rule-based scoring with actionable feedback

## 🏗️ Project Structure

```
ai_job_portal_recommendation_system/
├── backend/                    # Flask REST API
│   ├── app/
│   │   ├── models.py          # Database models
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.py        # Authentication
│   │   │   ├── auth2.py       # OTP, payments, extras
│   │   │   ├── jobs.py        # Job CRUD & applications
│   │   │   ├── seeker.py      # Candidate features
│   │   │   ├── employer.py    # Employer features
│   │   │   ├── admin.py       # Admin features
│   │   │   └── public.py      # Public endpoints
│   │   ├── services/          # Business logic & AI
│   │   │   ├── matcher.py     # AI recommendation engine
│   │   │   ├── llm.py         # LLM integration (OpenAI)
│   │   │   ├── ai_helpers.py  # AI utilities
│   │   │   ├── resume_parser.py # Resume parsing & ATS
│   │   │   ├── emailer.py     # Email service
│   │   │   └── payments.py    # Payment integration
│   │   └── __init__.py        # App factory
│   ├── data/                  # SQLite database
│   ├── uploads/               # Resume uploads
│   ├── tests/                 # Test suite
│   ├── app.py                 # Entry point
│   ├── config.py              # Configuration
│   └── requirements.txt       # Dependencies
│
└── frontant/                  # Frontend (HTML, CSS, JS)
    ├── admin/                 # Admin dashboard
    ├── Employer/              # Employer dashboard
    ├── job_seeker/            # Candidate dashboard
    ├── css/                   # Stylesheets
    ├── js/                    # JavaScript
    └── index.html             # Landing page
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask 3.1.3
- **Database**: SQLite with SQLAlchemy
- **Authentication**: JWT (Flask-JWT-Extended)
- **AI/ML**: scikit-learn (TF-IDF, Cosine Similarity), OpenAI API
- **File Processing**: pypdf, python-docx
- **Security**: bcrypt, Flask-CORS

### Frontend
- **Core**: Vanilla HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with modern design
- **Icons**: Font Awesome

## ⚡ Quick Start

### Prerequisites
- Python 3.8+
- pip

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables (optional)**
```bash
cp .env.example .env
# Edit .env with your API keys (OpenAI, SMTP, Razorpay) - not required for basic functionality
```

4. **Run the application**
```bash
python app.py
```

The server will start at `http://127.0.0.1:5000`
- Frontend: http://127.0.0.1:5000
- API Docs: http://127.0.0.1:5000/api/docs

### Demo Accounts

All demo accounts use password: `password123`

| Role | Email | Access |
|------|-------|--------|
| **Candidate** | `candidate@hirenova.ai` | Job search, applications, AI recommendations |
| **Employer** | `employer@hirenova.ai` | Post jobs, manage applicants, AI ranking |
| **Admin** | `admin@hirenova.ai` | Full platform management |

## 🤖 AI Features Configuration

### OpenAI Integration (Optional)
For enhanced AI-powered recommendations, cover letters, and chatbot:
```env
OPENAI_API_KEY=sk-your-api-key
LLM_MODEL=gpt-4o-mini
```
Without API key, the system falls back to rule-based and TF-IDF algorithms.

### Email Service (Optional)
For OTP and password reset emails:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="HireNova AI <noreply@hirenova.ai>"
```

### Payment Gateway (Optional)
For Razorpay integration:
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## 📊 API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | User registration |
| `POST /api/auth/login` | User login |
| `GET /api/jobs` | Browse jobs with filters |
| `GET /api/jobs/recommended` | AI-powered job recommendations (hybrid scoring) |
| `GET /api/seeker/ai/recommendations` | Advanced AI recommendations for candidates |
| `POST /api/seeker/resume/analyze` | Resume analysis & ATS scoring |
| `POST /api/seeker/cover-letter` | AI cover letter generation |
| `POST /api/seeker/chatbot` | AI career assistant |
| `GET /api/employer/jobs/<id>/ranking` | Candidate ranking for a job |
| `GET /api/employer/jobs/<id>/ai-ranking` | Advanced AI candidate ranking |
| `GET /api/admin/analytics` | Platform analytics |

Full API documentation available at `/api/docs` when running. The backend serves the frontend and API from the same origin, so you can use the full product at `http://127.0.0.1:5000`.

## 🧪 Testing

Run the test suite:
```bash
cd backend
python -m pytest tests/test_api.py -v
```

## 📝 License

This project is developed for educational and demonstration purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ by HireNova AI Team**
