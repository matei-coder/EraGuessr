# Firebase integration

Live demo: **https://student-ai26buc-7284.web.app**

| Product | What it does here | Code |
| --- | --- | --- |
| **Cloud Firestore** | Realtime, cross-device leaderboard | `src/lib/leaderboard.js`, `src/components/Leaderboard.jsx` |
| **Gemini API** (Nano Banana image model) | "✨ Generate scene with AI" — creates the period panorama on demand | `src/lib/ai.js` |
| **Firebase Hosting** | Static deploy of the Vite build | `firebase.json` |

Project: **`student-ai26buc-7284`** ("Romania Student AI Hack") · Web app: **historical-guesser**.
The Firebase web config in `src/firebase.js` is not a secret (it only identifies
the project; access is governed by Security Rules).

---

## Run locally

```bash
cd historical-guesser
npm install
# create .env.local with your Gemini key (see below), then:
npm run dev          # http://localhost:5173
```

Pick a name → it appears on the live leaderboard. Open the app in a second
browser/device to watch scores sync in realtime.

---

## Image generation (Gemini API key)

`src/lib/ai.js` calls the Gemini API directly (model `gemini-2.5-flash-image`,
"Nano Banana" — Imagen is avoided because all Imagen models shut down
2026-06-24). The key is read from `VITE_GEMINI_API_KEY`:

```bash
# historical-guesser/.env.local  (gitignored via "*.local" — never commit)
VITE_GEMINI_API_KEY=your-gemini-key
```

> ⚠️ **Key exposure:** `vite build` inlines `VITE_*` vars into the client
> bundle, so a **public deploy exposes the key** in the site's JS. Mitigations:
> 1. **Restrict the key** in Google Cloud Console → APIs & Services →
>    Credentials → (your key): set an **HTTP referrer** restriction to
>    `https://student-ai26buc-7284.web.app/*` and an **API** restriction to the
>    *Generative Language API* only.
> 2. **Rotate** the key after the event.
> 3. For a proper production setup, move the call behind a Cloud Function proxy
>    or use **Firebase AI Logic + App Check** so no key ships to the client.

---

## Leaderboard — Firestore rules

The `players` collection uses the rules in `firestore.rules` (already deployed to
this project's `(default)` database). The leaderboard is intentionally public and
unauthenticated; writes are strictly validated (fixed schema, type/size checks,
score may only grow, max 10,000 per round). It is a **reviewed prototype** — for
a real launch add Firebase Auth + App Check and tie writes to `request.auth.uid`.

```bash
cd historical-guesser
firebase deploy --only firestore:rules --project student-ai26buc-7284
```

### Data model

Collection `players`, document id = slug of the display name:

```
players/{slug} = {
  name:      string,     // 1..40 chars, immutable after create
  total:     number,     // cumulative score, may only increase
  rounds:    number,     // rounds played (+1 per submit)
  updatedAt: timestamp,  // server time
}
```

Leaderboard query: `orderBy('total', 'desc')` + `limit(10)` (single-field index,
created automatically — no composite index needed).

---

## Deploy to Firebase Hosting

```bash
cd historical-guesser
npm run build
firebase deploy --only hosting --project student-ai26buc-7284
# → https://student-ai26buc-7284.web.app
```
