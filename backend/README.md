# his_tribes API

FastAPI + SQLAlchemy backend for the his_tribes React/TanStack frontend.

## Local setup

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env
python run.py
```

API docs: http://localhost:8000/docs

For production, set `DATABASE_URL` to PostgreSQL and `SECRET_KEY` to a long random value.
