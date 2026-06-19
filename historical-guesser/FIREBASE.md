# Firebase integration

This demo wires three Firebase products into the Historical Guesser game.

| Product | What it does here | Code |
| --- | --- | --- |
| **Cloud Firestore** | Realtime, cross-device leaderboard | `src/lib/leaderboard.js`, `src/components/Leaderboard.jsx` |
| **Firebase AI Logic** (Gemini image model) | "✨ Generate scene with AI" — creates the period panorama on demand | `src/lib/ai.js` |
| **Firebase Hosting** | Static deploy of the Vite build | `firebase.json` |

Project: **`hackbase-7fb0e`** · Web app: **historical-guesser**
Config lives in `src/firebase.js` (the web `apiKey` is not a secret — it only identifies the project; access is governed by Security Rules).

---

## Run locally

```bash
cd historical-guesser
npm install
npm run dev          # http://localhost:5173
```

Pick a name → it appears on the live leaderboard. Open the app in a second
browser/device to watch scores sync in realtime.

---

## Prerequisites for the live features

### 1. Firestore leaderboard — deploy the rules ⚠️ READ THIS FIRST

The leaderboard reads/writes the `players` collection. It needs the rules in
`firestore.rules` to be live.

> **Warning:** This project's `(default)` Firestore database is **shared across
> the whole project**, including the existing *Stefan Gym Tracker* app.
> `firebase deploy --only firestore:rules` **replaces ALL rules** for that
> database. If another app relies on its own rules, deploying these as-is will
> break it.

Safe options:

- **Merge** the `match /players/{playerId} { ... }` block from `firestore.rules`
  into the project's existing rules (in the Firebase Console), then publish.
- **Or** isolate this game in a dedicated Firestore database and point
  `getFirestore(app, '<db-id>')` at it, so the default DB is untouched.

Only if you are sure nothing else depends on the default DB's rules:

```bash
cd historical-guesser
firebase deploy --only firestore:rules --project hackbase-7fb0e
```

The rules are a **reviewed prototype**: the leaderboard is intentionally public
and unauthenticated, writes are strictly validated (fixed schema, type/size
checks, score may only grow, max 10,000 per round). Before a real launch, add
Firebase Auth + App Check and tie writes to `request.auth.uid`.

### 2. AI scene generation — provision AI Logic + Blaze

```bash
cd historical-guesser
firebase init ailogic       # one-time: enables the Gemini Developer API
```

- Requires the **Blaze (pay-as-you-go)** billing plan (image models are paid).
- Without this, the "Generate scene with AI" button shows a friendly error and
  the rest of the game keeps working.
- Model: `gemini-2.5-flash-image` (Nano Banana). We avoid Imagen because all
  Imagen models shut down 2026-06-24.
- **App Check is recommended** to stop quota abuse from unauthorized clients.
  Not enabled in this demo — generation is behind a manual button to limit
  calls. Add reCAPTCHA Enterprise App Check before sharing widely.

---

## Deploy to Firebase Hosting

```bash
cd historical-guesser
npm run build
firebase deploy --only hosting --project hackbase-7fb0e
# → https://hackbase-7fb0e.web.app
```

---

## Data model

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
