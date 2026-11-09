"""HireNova AI backend — entrypoint.

Run:
    python app.py            # dev server (reads HOST/PORT/DEBUG env vars)
    flask --app app run      # same, via Flask CLI
    gunicorn app:app         # production WSGI
"""
import os

from app import create_app
from app.models import db

app = create_app()


@app.cli.command("seed")
def seed_cmd():
    from app.seed import seed
    with app.app_context():
        db.create_all()
        demo = seed()
        print(f"Seeded demo accounts (password: {demo['password']})")
        print(f"  candidate: {demo['candidate']}")
        print(f"  employer : {demo['employer']}")
        print(f"  admin    : {demo['admin']}")


@app.cli.command("initdb")
def initdb_cmd():
    with app.app_context():
        db.create_all()
        print("Database tables created.")


if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("DEBUG", "true").lower() in ("1", "true", "yes")
    app.run(host=host, port=port, debug=debug)
