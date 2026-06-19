// Cached AI scene lookup.
//
// Data model — collection `images`, document id = the location id it belongs to
// (one canonical image per location), so the cache key is just the location id:
//   {
//     locationId: string,
//     storagePath: string,   // path in Firebase Storage, e.g. "scenes/loc-001.png"
//     url: string,           // public download URL (render this in <img>)
//     prompt: string,
//     model: string,
//     status: 'pending' | 'ready' | 'failed',
//     createdAt: timestamp,
//   }
//
// The image FILE lives in Firebase Storage; Firestore only holds this metadata.
// Generation + upload is a server-side job (Admin SDK) — see src/lib/ai.js for
// the on-the-fly client generation used until the backend cache is wired up.
// The client only READS this collection.

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

const IMAGES = 'images';

/**
 * Get the cached scene image for a location, if one has been generated.
 * @param {string} locationId
 * @returns {Promise<{url:string, storagePath:string, status:string}|null>}
 *          the cached image metadata, or null if there is no ready image yet.
 */
export async function getCachedImage(locationId) {
  try {
    const snap = await getDoc(doc(db, IMAGES, locationId));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data.status !== 'ready' || !data.url) return null;
    return { url: data.url, storagePath: data.storagePath, status: data.status };
  } catch (err) {
    console.warn(`image cache lookup failed for ${locationId}:`, err);
    return null;
  }
}
