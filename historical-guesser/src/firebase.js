// Firebase initialization for Historical Guesser.
//
// Project: student-ai26buc-7284 ("Romania Student AI Hack"), dedicated to this
// game, so we use its (default) Firestore database directly.
// The web apiKey below is NOT a secret — it only identifies the project. Access
// is controlled by Firestore Security Rules (see firestore.rules). The Gemini
// key used for image generation is separate and lives in .env.local (see
// src/lib/ai.js).

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAexHcWftUo3wBsIM7_JjvYpfPP1pU_zj0',
  authDomain: 'student-ai26buc-7284.firebaseapp.com',
  projectId: 'student-ai26buc-7284',
  storageBucket: 'student-ai26buc-7284.firebasestorage.app',
  messagingSenderId: '943107530569',
  appId: '1:943107530569:web:075c52067783c4b0f18498',
};

export const app = initializeApp(firebaseConfig);

// Cloud Firestore — used for the realtime leaderboard.
export const db = getFirestore(app);

// Firebase Authentication — Google + email/password sign-in (see src/lib/auth.js).
export const auth = getAuth(app);

// NOTE: image generation does NOT go through Firebase AI Logic — it calls the
// Gemini API directly with a key (see src/lib/ai.js).
