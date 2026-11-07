"""HireNova AI backend — entrypoint.

Run:
    python app.py            # dev server on http://127.0.0.1:5000
    flask --app app run      # same, via Flask CLI
"""
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
    with app.app_context():
        db.create_all()
        from app.seed import seed

        seed()
    app.run(host="127.0.0.1", port=5000, debug=True)
