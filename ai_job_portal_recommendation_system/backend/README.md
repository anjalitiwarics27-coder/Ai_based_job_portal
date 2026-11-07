# HireNova AI — Backend

Flask + SQLAlchemy (SQLite) + JWT backend for the HireNova AI Job Portal
Recommendation System. Serves REST APIs and the static frontend in `../frontant/`.

## Quick start

```bash
# from this folder (backend/)
python -m pip install -r requirements.txt

# run (creates data/app.db + demo users + 12 jobs automatically)
python app.py
# open http://127.0.0.1:5000  (frontend)  •  http://127.0.0.1:5000/api/docs
```

Demo logins (password `password123` for all):

| Role | Email |
|------|-------|
| Candidate | `candidate@hirenova.ai` |
| Employer | `employer@hirenova.ai` |
| Admin | `admin@hirenova.ai` |

## Structure

```
backend/
  app.py            # entrypoint + app factory (registers all blueprints)
  config.py         # env-driven config (DB, JWT, uploads)
  app/
    models.py       # User, Job, Application, SavedJob, Notification, ResumeAnalysis, AuditLog, ContactMessage, PasswordReset
    seed.py         # demo users + 12 sample jobs
    routes/
      auth.py       # register / login / refresh / me / forgot+reset password
      jobs.py       # browse / create / update / apply / save / recommended
      seeker.py     # profile, dashboard, applications, saved, resume analysis, cover letter, chatbot, interview
      employer.py   # dashboard, my jobs, applicants, AI candidate ranking
      admin.py      # users, moderation, analytics, audit logs
      public.py     # health, stats, contact, notifications
    services/
      matcher.py    # TF-IDF + cosine similarity recommender (explainable)
      resume_parser.py # PDF/DOCX/TXT parsing + ATS score
      ai_helpers.py # cover-letter template, chatbot brain, interview questions
  data/app.db       # auto-created SQLite database
  uploads/          # resume uploads
  tests/            # pytest smoke tests
```

## Key APIs

Auth (`/api/auth`):

- `POST /register` `{first_name,last_name,email,password,role}` → JWT
- `POST /login` → JWT
- `GET /me` (JWT)
- `POST /forgot-password` → returns `dev_reset_token` (demo) — in prod, email it
- `POST /reset-password` `{token,password}`

Jobs (`/api/jobs`): `GET /?q=&location=&page=&per_page=` • `GET /<id>` • `POST /` (employer)
• `POST /<id>/apply` • `POST /<id>/save` • `GET /recommended?limit=10`

Seeker (`/api/seeker`): `GET /dashboard` • `GET /recommendations` • `GET /applications`
• `POST /resume/analyze` (file or `{text}`) • `POST /cover-letter {job_id}`
• `POST /chatbot {message}` • `POST /interview/generate {topic,count}`

Employer (`/api/employer`): `GET /dashboard` • `GET /jobs/<id>/applicants` • `GET /jobs/<id>/ranking`

Admin (`/api/admin`): `GET /dashboard|/users|/jobs|/analytics|/audit`

Public (`/api/public`): `GET /health` • `GET /stats` • `POST /contact` • `GET /notifications`

## AI matching

`services/matcher.py` vectorises candidate (skills+headline+experience+bio) and job
(title+skills+description+company+location) with TF-IDF and cosine similarity,
blended 75/25 with pure skill-overlap so scores stay explainable. Every
recommendation returns `reasons[]` (skill overlaps, location/experience hits)
which the frontend renders directly.

## Resume ATS scoring

PDF (pypdf / PyMuPDF fallback), DOCX (python-docx / zip-XML fallback) or TXT.
Scoring is rule-based: length, skill coverage, section presence, contact info,
and quantified impact language — returns `score` + `feedback` + `suggestions`.
