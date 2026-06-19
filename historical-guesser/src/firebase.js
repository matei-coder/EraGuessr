// Firebase initialization for Historical Guesser.
//
// Project: hackbase-7fb0e (web app "historical-guesser").
// The web apiKey below is NOT a secret — it only identifies the project. Access
// is controlled by Firestore Security Rules (see firestore.rules) and, for
// production, Firebase App Check. See FIREBASE.md.

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  ResponseModality,
} from 'firebase/ai';

const firebaseConfig = {
  apiKey: 'AIzaSyCBc0p9p7LZ7ZoZQ8wT4bdsP3W15esTVTw',
  authDomain: 'hackbase-7fb0e.firebaseapp.com',
  projectId: 'hackbase-7fb0e',
  storageBucket: 'hackbase-7fb0e.firebasestorage.app',
  messagingSenderId: '405204582716',
  appId: '1:405204582716:web:7ef44a9a1fafaa06c95e39',
  measurementId: 'G-Y2XT73RJYK',
};

export const app = initializeApp(firebaseConfig);

// Cloud Firestore — used for the realtime leaderboard.
export const db = getFirestore(app);

// Firebase AI Logic — Gemini Developer API backend.
// Provision once with: `firebase init ailogic` (else PERMISSION_DENIED).
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Image generation model (Nano Banana). Imagen models are deprecated
// (shut down 2026-06-24), so we use the stable Gemini image model.
export const imageModel = getGenerativeModel(ai, {
  model: 'gemini-2.5-flash-image',
  generationConfig: {
    responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
  },
});
