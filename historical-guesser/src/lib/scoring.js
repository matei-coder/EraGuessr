// Pure scoring helpers shared by the game loop (App) and the result panel
// (ScoreBoard). Kept dependency-free so it is trivial to reason about and test.

/**
 * Great-circle distance between two lat/lng points in kilometers.
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// 5000 pts at 0 km, decaying with distance.
export function distanceToScore(km) {
  return Math.round(5000 * Math.exp(-km / 2000));
}

// 5000 pts for an exact year, losing ~50 pts per year off.
export function yearToScore(yearDelta) {
  return Math.max(0, Math.round(5000 - yearDelta * 50));
}

/**
 * Compute the full breakdown for one round.
 * Max total is 10,000 (5,000 location + 5,000 year) — the upper bound the
 * Firestore rules enforce per round.
 *
 * @param {{lat:number,lng:number}|null} guess
 * @param {number} guessYear
 * @param {{lat:number,lng:number,year:number}} actual
 */
export function computeRoundScore(guess, guessYear, actual) {
  const distanceKm = guess
    ? haversineKm(guess.lat, guess.lng, actual.lat, actual.lng)
    : null;
  const yearDelta = Math.abs(guessYear - actual.year);

  const distanceScore = guess ? distanceToScore(distanceKm) : 0;
  const yearScore = yearToScore(yearDelta);

  return {
    distanceKm,
    distanceScore,
    yearDelta,
    yearScore,
    total: distanceScore + yearScore,
  };
}
