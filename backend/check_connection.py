"""
EraGuessr backend connectivity smoke test.

Verifies the two backend dependencies from stack.md:
  1. Cloud Firestore  -- write + read a doc via the Admin SDK (service account)
  2. Gemini API       -- run a tiny "hello" prompt via a Gemini API key

Usage:
    python check_connection.py

All config is read from a .env file (see .env.example). Nothing is hardcoded,
and no secrets live in this file.
"""

from __future__ import annotations

import os
import sys

from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "hackbase-7fb0e")
SERVICE_ACCOUNT_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccountKey.json")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _ok(msg: str) -> None:
    print(f"  [OK] {msg}")


def _fail(msg: str) -> None:
    print(f"  [!!] {msg}")


def check_firestore() -> bool:
    """Connect with the Admin SDK, then write and read back one document."""
    print("\n[1/2] Cloud Firestore (Admin SDK)")

    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        _fail(f"Service account key not found at: {SERVICE_ACCOUNT_PATH}")
        print("       Firebase Console > Project Settings > Service accounts >")
        print("       Generate new private key, then save it to that path.")
        return False

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError as exc:
        _fail(f"firebase-admin not installed ({exc}). Run: pip install -r requirements.txt")
        return False

    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        if not firebase_admin._apps:  # avoid double-init on reruns
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        _ok(f"Connected to project '{cred.project_id}'")

        doc_ref = db.collection("_healthcheck").document("backend-smoke-test")
        doc_ref.set(
            {
                "message": "hello from the EraGuessr backend",
                "source": "check_connection.py",
                "ts": firestore.SERVER_TIMESTAMP,
            }
        )
        _ok("Wrote document  _healthcheck/backend-smoke-test")

        snap = doc_ref.get()
        if not snap.exists:
            _fail("Wrote the document but could not read it back")
            return False

        data = snap.to_dict()
        _ok(f"Read it back -> message={data.get('message')!r}, ts={data.get('ts')}")
        return True
    except Exception as exc:  # noqa: BLE001 - smoke test wants the full reason
        _fail(f"Firestore error: {type(exc).__name__}: {exc}")
        return False


def check_gemini() -> bool:
    """Run a single short 'hello' prompt against the Gemini API."""
    print("\n[2/2] Gemini API (google-genai)")

    if not GEMINI_API_KEY:
        _fail("GEMINI_API_KEY is not set in .env")
        print("       Generate one at https://aistudio.google.com/apikey")
        return False

    try:
        from google import genai
    except ImportError as exc:
        _fail(f"google-genai not installed ({exc}). Run: pip install -r requirements.txt")
        return False

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        resp = client.models.generate_content(
            model=GEMINI_MODEL,
            contents="Say a short, friendly hello and confirm you are online.",
        )
        text = (resp.text or "").strip()
        if not text:
            _fail("Gemini returned an empty response")
            return False
        _ok(f"Model '{GEMINI_MODEL}' replied:")
        print(f"       {text}")
        return True
    except Exception as exc:  # noqa: BLE001 - smoke test wants the full reason
        _fail(f"Gemini error: {type(exc).__name__}: {exc}")
        return False


def main() -> int:
    print("=" * 60)
    print("EraGuessr backend connectivity check")
    print("=" * 60)

    firestore_ok = check_firestore()
    gemini_ok = check_gemini()

    print("\n" + "=" * 60)
    print(f"Firestore: {'PASS' if firestore_ok else 'FAIL'}    "
          f"Gemini: {'PASS' if gemini_ok else 'FAIL'}")
    print("=" * 60)
    return 0 if (firestore_ok and gemini_ok) else 1


if __name__ == "__main__":
    sys.exit(main())
