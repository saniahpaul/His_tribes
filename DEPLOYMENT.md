# his_tribes deployment

Recommended production setup: Render Web Service (FastAPI) + Render/PostgreSQL-compatible database + Render Web Service (TanStack Start frontend).

1. Deploy `his-tribes-api` from the `backend` directory.
2. Create/use a PostgreSQL database and set `DATABASE_URL` to its connection string.
3. Set `SECRET_KEY` to a long random value.
4. Set `CORS_ORIGINS` to the final frontend URL.
5. Set `SEED_LEADER_EMAIL`, `SEED_LEADER_PASSWORD`, and `SEED_LEADER_NAME` for the first leader account. Remove the password env var after the initial seed if desired.
6. Deploy `his-tribes-web` from `frontend` with `NITRO_PRESET=render-com`.
7. Set `VITE_API_URL` to the API service URL and redeploy the frontend because VITE variables are bundled into browser code.
8. Open `https://<api-host>/docs` and verify the FastAPI docs, then open the frontend URL and sign up.
