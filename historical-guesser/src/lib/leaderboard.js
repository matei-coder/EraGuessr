// Realtime leaderboard backed by Cloud Firestore.
//
// Data model — collection `players`, document id = slug(name):
//   { name: string, total: number, rounds: number, updatedAt: timestamp }
//
// Each round adds the round score to the player's cumulative `total` with an
// atomic increment, so concurrent players never clobber each other.

import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';

const PLAYERS = 'players';

/**
 * Turn a display name into a stable, safe Firestore document id.
 * Same name (case-insensitive) -> same id, so a player's score accumulates.
 */
export function playerId(name) {
  const slug = (name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'player';
}

/**
 * Add one round's score to a player's cumulative total. Creates the player
 * document on the first round (increment treats a missing field as 0).
 */
export async function submitScore(name, roundScore) {
  const ref = doc(db, PLAYERS, playerId(name));
  await setDoc(
    ref,
    {
      name: (name || 'Player').trim().slice(0, 40),
      total: increment(Math.round(roundScore)),
      rounds: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Subscribe to the live top-N leaderboard.
 * @param {(rows: Array<{id:string,name:string,total:number,rounds:number}>) => void} cb
 * @returns unsubscribe function
 */
export function subscribeLeaderboard(cb, max = 10) {
  const q = query(collection(db, PLAYERS), orderBy('total', 'desc'), limit(max));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error('Leaderboard subscription error:', err)
  );
}
