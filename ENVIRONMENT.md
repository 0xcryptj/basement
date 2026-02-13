# Environment variables

Create a `.env` file in the repo root (it is gitignored) and set:

- `VITE_SUPABASE_PROJECT_ID` — your Supabase project id
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key (treat as sensitive anyway)
- `VITE_SUPABASE_URL` — your Supabase project URL

Notes:
- Don’t commit `.env`.
- If any key lands in git history, rotate it.
