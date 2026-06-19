// Round catalog access.
//
// Data model — collection `locations`, document id = stable slug (e.g. "loc-001"):
//   {
//     title: string, lat: number, lng: number, year: number,
//     yearRange: { min: number, max: number },
//     description?: string, credit?: string,
//     imageId?: string,        // -> images/{imageId}
//     active: boolean,
//     createdAt: timestamp,
//   }
//
// Locations are seeded server-side (see backend/seed_firestore.py); the client
// only reads them. If Firestore is empty or unreachable we fall back to the
// bundled static dataset so the game always has rounds to play.

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import staticDataset from '../data/dataset.json';

const LOCATIONS = 'locations';

/** Normalize a Firestore/static row to the shape the game expects. */
function normalize(id, d) {
  return {
    id,
    title: d.title,
    lat: d.lat,
    lng: d.lng,
    year: d.year,
    yearRange: d.yearRange,
    description: d.description || '',
    credit: d.credit || '',
    imageId: d.imageId || id,
  };
}

/**
 * Load the active round catalog. Tries Firestore first, falls back to the
 * bundled dataset.json on empty/error so the demo never breaks.
 * @returns {Promise<Array>} list of normalized locations
 */
export async function getLocations() {
  try {
    const q = query(collection(db, LOCATIONS), where('active', '==', true));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((doc) => normalize(doc.id, doc.data()));
    }
    console.warn('locations collection is empty — using bundled dataset.json');
  } catch (err) {
    console.warn('locations fetch failed — using bundled dataset.json:', err);
  }
  return staticDataset.locations.map((l) => normalize(l.id, l));
}
