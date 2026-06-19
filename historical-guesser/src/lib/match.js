// Kahoot-style multiplayer matches backed by Cloud Firestore.
//
// Data model — collection `matches`, doc id = short join CODE:
//   { code, hostUid, hostName, status: 'lobby'|'playing'|'finished',
//     mode: 'real'|'ai', levelIds: string[], createdAt, startedAt }
//   subcollection `players/{uid}`:
//     { uid, name, scores: number[], average, currentLevel, finished,
//       joinedAt, updatedAt }
//
// The host picks the levels at create time and stores their ids, so every
// player plays the exact same 5 levels. When the host flips status to
// 'playing', every subscribed client starts together.

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { currentUser, displayNameFor } from './auth.js';
import { buildGame } from './catalog.js';

const MATCHES = 'matches';

// Unambiguous alphabet (no 0/O/1/I) for easy-to-read join codes.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(len = 5) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

function requireUser() {
  const user = currentUser();
  if (!user) throw new Error('You must be signed in.');
  return user;
}

// Add (or refresh) the current user as a player in a match.
async function joinAsPlayer(code) {
  const user = requireUser();
  const ref = doc(db, MATCHES, code, 'players', user.uid);
  await setDoc(
    ref,
    {
      uid: user.uid,
      name: displayNameFor(user),
      scores: [],
      average: 0,
      currentLevel: 0,
      finished: false,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Create a new match in the given mode and join it as host.
 * @param {{mode:'real'|'ai'}} opts
 * @returns {Promise<string>} the join code
 */
export async function createMatch({ mode } = {}) {
  const user = requireUser();
  const code = generateCode();
  const levelIds = buildGame().map((l) => l.id);

  await setDoc(doc(db, MATCHES, code), {
    code,
    hostUid: user.uid,
    hostName: displayNameFor(user),
    status: 'lobby',
    mode: mode === 'ai' ? 'ai' : 'real',
    levelIds,
    createdAt: serverTimestamp(),
    startedAt: null,
  });

  await joinAsPlayer(code);
  return code;
}

/**
 * Join an existing match by code. Throws if it doesn't exist or already started.
 * @param {string} code
 * @returns {Promise<object>} the match data
 */
export async function joinMatch(code) {
  const clean = (code || '').trim().toUpperCase();
  if (!clean) throw new Error('Enter a match code.');
  const ref = doc(db, MATCHES, clean);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('No match with that code.');
  const data = snap.data();
  if (data.status !== 'lobby') {
    throw new Error('That match has already started.');
  }
  await joinAsPlayer(clean);
  return data;
}

/** Host-only: flip the match to 'playing' so everyone starts together. */
export async function startMatch(code) {
  await updateDoc(doc(db, MATCHES, code), {
    status: 'playing',
    startedAt: serverTimestamp(),
  });
}

/** Update the current player's live progress (drives the in-match standings). */
export async function reportProgress(code, { scores, currentLevel, average }) {
  const user = requireUser();
  await updateDoc(doc(db, MATCHES, code, 'players', user.uid), {
    scores: scores ?? [],
    currentLevel: currentLevel ?? 0,
    average: average ?? 0,
    updatedAt: serverTimestamp(),
  });
}

/** Mark the current player finished with their final average. */
export async function finishMatch(code, { scores, average }) {
  const user = requireUser();
  await updateDoc(doc(db, MATCHES, code, 'players', user.uid), {
    scores: scores ?? [],
    average: average ?? 0,
    currentLevel: (scores ?? []).length,
    finished: true,
    updatedAt: serverTimestamp(),
  });
}

/** Best-effort: remove the current player from a match (e.g. leaving the lobby). */
export async function leaveMatch(code) {
  const user = currentUser();
  if (!user) return;
  try {
    await deleteDoc(doc(db, MATCHES, code, 'players', user.uid));
  } catch (err) {
    console.error('leaveMatch failed:', err);
  }
}

/** Subscribe to a match document. cb receives the data or null if gone. */
export function subscribeMatch(code, cb) {
  return onSnapshot(
    doc(db, MATCHES, code),
    (snap) => cb(snap.exists() ? snap.data() : null),
    (err) => console.error('match subscription error:', err)
  );
}

/** Subscribe to the players in a match, ordered by join time. */
export function subscribePlayers(code, cb) {
  const q = query(
    collection(db, MATCHES, code, 'players'),
    orderBy('joinedAt', 'asc')
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error('players subscription error:', err)
  );
}
