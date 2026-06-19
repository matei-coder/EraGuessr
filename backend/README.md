# EraGuessr — Backend

Minimal Python backend for the EraGuessr hackathon project. Right now it is a
**connectivity smoke test** that proves the backend can reach the two services
from `stack.md`:

1. **Cloud Firestore** (project `hackbase-7fb0e`) via the Firebase Admin SDK
2. **Gemini API** via a Gemini API key

## Setup

```bash
cd backend

# 1. Create + activate a virtual environment
python -m venv .venv
source .venv/Scripts/activate     # Git Bash on Windows
# .venv\Scripts\activate          # PowerShell / cmd
# source .venv/bin/activate       # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure secrets
cp .env.example .env
```

Then fill in `.env`:

- **`GEMINI_API_KEY`** — generate at <https://aistudio.google.com/apikey>
- **`serviceAccountKey.json`** — Firebase Console → Project Settings →
  Service accounts → *Generate new private key*. Save the downloaded file as
  `backend/serviceAccountKey.json`.

Both `.env` and `serviceAccountKey.json` are gitignored — never commit them.

## Run

```bash
python check_connection.py
```

Expected output:

```
[1/2] Cloud Firestore (Admin SDK)
  [OK] Connected to project 'hackbase-7fb0e'
  [OK] Wrote document  _healthcheck/backend-smoke-test
  [OK] Read it back -> message='hello from the EraGuessr backend', ts=...

[2/2] Gemini API (google-genai)
  [OK] Model 'gemini-2.5-flash' replied:
       Hello! I'm online ...

Firestore: PASS    Gemini: PASS
```

## Notes

- The Admin SDK uses a service account, so it **bypasses Firestore security
  rules** — this is the correct pattern for the future Cloud Functions backend.
- `check_connection.py` writes to a throwaway `_healthcheck` collection; delete
  it anytime.
