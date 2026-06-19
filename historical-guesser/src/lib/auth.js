// Firebase Authentication helpers — Google + email/password.
//
// The whole game gates behind sign-in (see AuthGate). The signed-in user's
// display name (or email prefix) becomes their leaderboard name.

import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase.js';

const googleProvider = new GoogleAuthProvider();

/** Sign in with a Google account (popup). */
export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/** Create a new account with email + password. */
export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/** Sign in to an existing email + password account. */
export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Sign the current user out. */
export function signOutUser() {
  return signOut(auth);
}

/** Subscribe to auth state; cb receives the user or null. Returns unsubscribe. */
export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

/** The currently signed-in Firebase user (or null). */
export function currentUser() {
  return auth.currentUser;
}

/** A friendly leaderboard name for a signed-in user. */
export function displayNameFor(user) {
  if (!user) return 'Player';
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];
  return 'Player';
}

/** Turn a raw Firebase auth error into a short, human-friendly message. */
export function friendlyAuthError(err) {
  const code = err?.code || '';
  const map = {
    'auth/invalid-email': 'That email address looks invalid.',
    'auth/missing-password': 'Please enter a password.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/email-already-in-use': 'That email already has an account — try signing in.',
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/wrong-password': 'Wrong email or password.',
    'auth/user-not-found': 'No account with that email — try creating one.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/unauthorized-domain': 'This domain is not authorized for sign-in.',
  };
  return map[code] || err?.message || 'Something went wrong. Try again.';
}
