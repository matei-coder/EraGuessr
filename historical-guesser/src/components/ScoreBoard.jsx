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
 *   - fact: { text, loading, error } -> AI blurb about the correct location
 *   - level: number      0-based index of the current level
 *   - levelCount: number total levels in a game
 *   - onNext: () => void
 */
export default function ScoreBoard({
  guess,
  guessYear,
  actual,
  fact,
  level = 0,
  levelCount = 1,
  onNext,
}) {
  if (!actual) return null;

  const { distanceKm, distanceScore, yearDelta, yearScore, total } =
    computeRoundScore(guess, guessYear, actual);

  const isLast = level >= levelCount - 1;

  return (
    <div className="result">
      <h2>
        Runda {level + 1} / {levelCount} · Rezultate
      </h2>

      <div className="round-score">
        <div className="rs-label">Scor rundă</div>
        <div className="rs-value">+{total.toLocaleString()}</div>
      </div>

      <p className="result-title">
        <span className="pin">📍</span>
        {actual.title}
      </p>

      {/* AI roast about the guess */}
      {fact && (fact.loading || fact.text || fact.error) && (
        <p
          className={`roast${fact.error ? ' is-error' : ''}${
            fact.loading ? ' is-loading' : ''
          }`}
        >
          {fact.loading
            ? '😏 Îți cântărim alegerea…'
            : fact.error
              ? `Nu am putut încărca un comentariu (${fact.error})`
              : fact.text}
        </p>
      )}

      <div className="stats">
        <div className="stat">
          <div>
            <div className="stat-label">Distanță</div>
            <div className="stat-detail">
              {distanceKm == null
                ? 'fără ghicire'
                : `${distanceKm.toFixed(1)} km distanță`}
            </div>
          </div>
          <div className="stat-pts">+{distanceScore.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div>
            <div className="stat-label">An</div>
            <div className="stat-detail">
              {yearDelta} ani diferență (tu {guessYear} · corect {actual.year})
            </div>
          </div>
          <div className="stat-pts">+{yearScore.toLocaleString()}</div>
        </div>
      </div>

      <button className="btn btn-primary btn-block btn-lg" onClick={onNext}>
        {isLast ? 'Vezi rezultatul final →' : 'Runda Următoare →'}
      </button>
    </div>
  );
}

// Re-export for any existing callers/tests.
export { haversineKm } from '../lib/scoring.js';
