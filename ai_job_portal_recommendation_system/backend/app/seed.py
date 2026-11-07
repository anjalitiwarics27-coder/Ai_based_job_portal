"""Seed demo users + jobs so every frontend page has data on first run."""
from .models import Job, User, db

DEMO_PASSWORD = "password123"

JOBS = [
    ("Frontend Developer", "Google", "Bengaluru", "Full-time", "₹12 - ₹18 LPA", "0-2 Years", "HTML, CSS, JavaScript, React", "Software Development", "Build delightful, high-performance web interfaces with React and modern CSS."),
    ("Software Engineer", "Microsoft", "Hyderabad", "Full-time", "₹15 - ₹22 LPA", "2-4 Years", "C++, DSA, SQL, Python", "Software Development", "Design and ship scalable backend services and cloud-native APIs."),
    ("AI/ML Intern", "Amazon", "Noida", "Internship", "₹8 - ₹12 LPA", "Fresher", "Python, TensorFlow, Machine Learning", "Artificial Intelligence", "Work on ML models for recommendation and search relevance."),
    ("AI Engineer", "Google", "Bangalore", "Full-time", "₹18 - ₹28 LPA", "3-5 Years", "Python, ML, TensorFlow", "Artificial Intelligence", "Work on machine learning models and AI solutions at scale."),
    ("Full Stack Developer", "Microsoft", "Hyderabad", "Remote", "₹10 - ₹16 LPA", "0-3 Years", "HTML, CSS, JavaScript, Node.js", "Software Development", "Build scalable web applications using modern technologies."),
    ("Data Scientist", "Amazon", "Delhi", "Full-time", "₹14 - ₹20 LPA", "2-5 Years", "Python, SQL, Data Science", "Data Science", "Analyze data and create predictive ML models."),
    ("Product Designer", "Nimbus Finance", "Remote", "Full-time", "₹12 - ₹18 LPA", "4-6 Years", "Figma, UI Design, UX Design", "Design", "Lead end-to-end product design for a fintech platform."),
    ("UX Designer", "Kestrel Health", "Remote", "Contract", "₹9 - ₹13 LPA", "1-3 Years", "Figma, User Research", "Design", "Design accessible healthcare experiences."),
    ("Data Analyst", "TCS", "Mumbai", "Full-time", "₹6 - ₹10 LPA", "0-2 Years", "Python, Excel, SQL, Power BI", "Data Science", "Turn raw data into dashboards and business insights."),
    ("DevOps Engineer", "Infosys", "Pune", "Full-time", "₹11 - ₹17 LPA", "2-4 Years", "Docker, Kubernetes, AWS, Linux", "Cloud Computing", "Automate CI/CD and manage cloud infrastructure."),
    ("Backend Engineer", "Flipkart", "Bengaluru", "Full-time", "₹13 - ₹19 LPA", "2-5 Years", "Node.js, Express, MongoDB, REST API", "Software Development", "Build high-throughput APIs and data pipelines."),
    ("Machine Learning Engineer", "Adobe", "Noida", "Full-time", "₹16 - ₹24 LPA", "3-6 Years", "Python, PyTorch, Deep Learning", "Artificial Intelligence", "Train and deploy deep learning models for content intelligence."),
]


def seed():
    # users
    def ensure_user(email, role, first, last, skills, company=""):
        u = User.query.filter_by(email=email).first()
        if not u:
            u = User(email=email, role=role, first_name=first, last_name=last, company_name=company)
            u.set_password(DEMO_PASSWORD)
            u.skills = skills
            u.headline = f"{role.capitalize()} at {company or 'HireNova AI'}"
            u.location = "Bengaluru"
            db.session.add(u)
            db.session.flush()
        return u

    employer = ensure_user("employer@hirenova.ai", "employer", "HR", "Team", "", "Google")
    candidate = ensure_user("candidate@hirenova.ai", "candidate", "Anjali", "Tiwari", "HTML, CSS, JavaScript, React, Python, Machine Learning")
    admin = ensure_user("admin@hirenova.ai", "admin", "Admin", "User", "")
    db.session.commit()

    # Demo applications + notifications so dashboards feel alive on first login
    from .models import Application, Notification
    db.session.commit()
    for title, company, loc, typ, sal, exp, skills, cat, desc in JOBS:
        exists = Job.query.filter_by(title=title, company=company).first()
        if not exists:
            db.session.add(Job(
                title=title, company=company, location=loc, job_type=typ, salary=sal,
                experience=exp, skills=skills, description=desc, category=cat,
                employer_id=employer.id, is_active=True,
            ))
    db.session.commit()

    # seed 2 demo applications for candidate
    job1 = Job.query.filter_by(title="Frontend Developer").first()
    job2 = Job.query.filter_by(title="AI/ML Intern").first()
    if job1 and not Application.query.filter_by(candidate_id=candidate.id, job_id=job1.id).first():
        db.session.add(Application(candidate_id=candidate.id, job_id=job1.id, status="Interview", cover_letter="Dear Hiring Team, I am excited to apply..."))
    if job2 and not Application.query.filter_by(candidate_id=candidate.id, job_id=job2.id).first():
        db.session.add(Application(candidate_id=candidate.id, job_id=job2.id, status="Applied", cover_letter="Dear Hiring Team, I am excited to apply..."))
    if not Notification.query.filter_by(user_id=candidate.id).first():
        db.session.add(Notification(user_id=candidate.id, title="Interview Scheduled", body="Google HR round on 15 July 2026, 10:00 AM.", is_read=False))
        db.session.add(Notification(user_id=candidate.id, title="New Match Found", body="Frontend Developer at Google — 96% match.", is_read=False))
    if not Notification.query.filter_by(user_id=employer.id).first():
        db.session.add(Notification(user_id=employer.id, title="New Application", body="Anjali Tiwari applied for Frontend Developer.", is_read=False))
    db.session.commit()
    return {"candidate": candidate.email, "employer": employer.email, "admin": admin.email, "password": DEMO_PASSWORD}
