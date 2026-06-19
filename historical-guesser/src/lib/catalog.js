// The playable round catalog, built from the 360° panoramas in
// public/all_360_images (parsed at build time into src/data/images360.json by
// scripts/build-image-catalog.mjs).
//
// Each round is a real historical event with a true year + location and an
// equirectangular image the player can look around in.

import images360 from '../data/images360.json';

// One shared timeline spanning all of recorded history in the catalog, so the
// slider never hints at the answer's era.
export const YEAR_MIN = -2600;
export const YEAR_MAX = new Date().getFullYear();

// A neutral starting guess for the slider each round.
export const START_YEAR = 1000;

export const locations = images360.map((l) => ({
  id: l.id,
  title: l.title,
  lat: l.lat,
  lng: l.lng,
  year: l.year,
  image: l.image,
  description: '',
  yearRange: { min: YEAR_MIN, max: YEAR_MAX },
}));

// How many levels (rounds) make up a single game.
export const LEVELS_PER_GAME = 5;

/**
 * Build one game: `count` distinct locations in random order (no repeats within
 * a game). Uses a Fisher–Yates shuffle on a copy of the catalog.
 * @param {number} count
 * @returns {Array<typeof locations[number]>}
 */
export function buildGame(count = LEVELS_PER_GAME) {
  const pool = [...locations];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

/**
 * Rebuild a game from a list of location ids — so every player in a match plays
 * the exact same levels in the same order. Unknown ids are dropped.
 * @param {string[]} ids
 */
export function gameFromIds(ids) {
  const byId = new Map(locations.map((l) => [l.id, l]));
  return (ids || []).map((id) => byId.get(id)).filter(Boolean);
}
