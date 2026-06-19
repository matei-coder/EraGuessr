import { computeRoundScore } from '../lib/scoring.js';

/**
 * ScoreBoard
 * Shows the result of a round: distance from the true location (Haversine)
 * and how far off the year guess was, plus the combined score and whether the
 * score was saved to the live leaderboard.
 *
 * Props:
 *   - guess:  { lat, lng } | null
 *   - guessYear: number
 *   - actual: { lat, lng, year, title } -> the location's truth
 *   - saveState: 'idle' | 'saving' | 'saved' | 'error'
 *   - onNext: () => void
 */
export default function ScoreBoard({ guess, guessYear, actual, saveState, onNext }) {
  if (!actual) return null;

  const { distanceKm, distanceScore, yearDelta, yearScore, total } =
    computeRoundScore(guess, guessYear, actual);

  return (
    <div style={{ padding: '1rem', lineHeight: 1.6 }}>
      <h2 style={{ marginTop: 0 }}>Round Result</h2>
      <p>
        <strong>{actual.title}</strong>
      </p>
      <p>
        Distance:{' '}
        {distanceKm == null ? 'no guess placed' : `${distanceKm.toFixed(1)} km`}{' '}
        — {distanceScore.toLocaleString()} pts
      </p>
      <p>
        Year off by: {yearDelta} years (you: {guessYear}, actual: {actual.year})
        — {yearScore.toLocaleString()} pts
      </p>
      <p style={{ fontSize: '1.3rem' }}>
        <strong>Total: {total.toLocaleString()} / 10,000</strong>
      </p>
      <p style={{ fontSize: '0.85rem', opacity: 0.8, minHeight: '1.2em' }}>
        {saveState === 'saving' && '⏳ Saving to leaderboard…'}
        {saveState === 'saved' && '✅ Added to the live leaderboard'}
        {saveState === 'error' &&
          '⚠️ Could not save score (check Firestore rules / connection)'}
      </p>
      <button onClick={onNext}>Next location →</button>
    </div>
  );
}

// Re-export for any existing callers/tests.
export { haversineKm } from '../lib/scoring.js';
