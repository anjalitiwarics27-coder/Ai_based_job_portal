"""Smoke tests — run with: python -m pytest backend/tests/test_api.py -v"""
import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")


def make_client():
    from app import create_app
    from app.models import db

    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": f"sqlite:///{path}",
        "UPLOAD_DIR": tempfile.mkdtemp(),
    })
    with app.app_context():
        db.create_all()
        from app.seed import seed
        seed()
    return app.test_client()


def test_health_and_stats(client=None):
    c = client or make_client()
    assert c.get("/api/public/health").status_code == 200
    r = c.get("/api/public/stats")
    assert r.status_code == 200
    assert r.get_json()["data"]["active_jobs"] >= 10


def test_auth_flow():
    c = make_client()
    # register
    r = c.post("/api/auth/register", json={
        "first_name": "Test", "last_name": "User", "email": "test123@hirenova.ai",
        "password": "password123", "role": "candidate",
    })
    assert r.status_code == 201, r.get_json()
    token = r.get_json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    # me
    assert c.get("/api/auth/me", headers=headers).status_code == 200
    # jobs
    r = c.get("/api/jobs")
    assert r.status_code == 200
    jobs = r.get_json()["data"]["jobs"]
    assert len(jobs) >= 10
    # recommended (JWT)
    r = c.get("/api/jobs/recommended?limit=3", headers=headers)
    assert r.status_code == 200
    recs = r.get_json()["data"]["recommendations"]
    assert len(recs) == 3
    assert all("match_score" in x for x in recs)
    # apply + applications
    job_id = jobs[0]["id"]
    r = c.post(f"/api/jobs/{job_id}/apply", headers=headers, json={"cover_letter": "Hi"})
    assert r.status_code in (201, 409)
    r = c.get("/api/seeker/dashboard", headers=headers)
    assert r.status_code == 200
    # chatbot
    r = c.post("/api/seeker/chatbot", headers=headers, json={"message": "How do I improve my resume?"})
    assert r.status_code == 200
    assert "reply" in r.get_json()["data"]
    # cover letter
    r = c.post("/api/seeker/cover-letter", headers=headers, json={"job_id": job_id})
    assert r.status_code == 200
    # resume pasted text
    r = c.post("/api/seeker/resume/analyze", headers=headers, json={
        "text": "Python, React, JavaScript. Experience: built web apps. Education: BTech. Projects: AI chatbot. Contact: a@b.com, 9876543210."
    })
    assert r.status_code == 201
    assert r.get_json()["data"]["score"] > 0


def test_employer_and_admin():
    c = make_client()
    r = c.post("/api/auth/login", json={"email": "employer@hirenova.ai", "password": "password123"})
    assert r.status_code == 200
    etoken = r.get_json()["data"]["access_token"]
    eh = {"Authorization": f"Bearer {etoken}"}
    assert c.get("/api/employer/dashboard", headers=eh).status_code == 200
    r = c.post("/api/jobs", headers=eh, json={"title": "Backend Dev", "company": "Acme", "skills": ["Python", "Flask"]})
    assert r.status_code == 201, r.get_json()

    r = c.post("/api/auth/login", json={"email": "admin@hirenova.ai", "password": "password123"})
    atoken = r.get_json()["data"]["access_token"]
    ah = {"Authorization": f"Bearer {atoken}"}
    assert c.get("/api/admin/dashboard", headers=ah).status_code == 200
    assert c.get("/api/admin/analytics", headers=ah).status_code == 200


if __name__ == "__main__":
    test_health_and_stats()
    print("health+stats OK")
    test_auth_flow()
    print("auth flow OK")
    test_employer_and_admin()
    print("employer+admin OK")
    print("ALL BACKEND TESTS PASSED")
