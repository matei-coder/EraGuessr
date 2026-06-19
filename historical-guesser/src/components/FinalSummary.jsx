import { averageScore } from '../lib/scoring.js';

/**
 * FinalSummary
 * Shown after the last level of a game. Reports the final score as the average
 * of the per-level totals, lists each level's score, shows whether the average
 * was saved to the leaderboard, and offers a fresh game.
 *
 * Props:
 *   - game:   Array<{ title }>          the 5 locations played, in order
 *   - scores: number[]                  per-level totals (0–10,000 each)
 *   - saveState: 'idle'|'saving'|'saved'|'error'
 *   - standings: Array<{uid,name,average,finished}> | null   match ranking
 *   - meUid:  string                    current player's uid (to highlight)
 *   - onPlayAgain: () => void
 */
export default function FinalSummary({
  game,
  scores,
  saveState,
  standings,
  meUid,
  onPlayAgain,
}) {
  const average = averageScore(scores);
  const ranked = standings
    ? [...standings].sort((a, b) => (b.average || 0) - (a.average || 0))
    : null;

  return (
    <div className="result final">
      <h2>Final · Clasament meci</h2>

      <div className="total">
        <span className="total-label">Scor mediu</span>
        <span className="total-value">{average.toLocaleString()} / 10,000</span>
      </div>

      {ranked && (
        <div className="match-standings">
          <div className="stat-label" style={{ marginBottom: '0.4rem' }}>
            Clasamentul meciului
          </div>
          {ranked.map((p, i) => (
            <div
              className={`stat${p.uid === meUid ? ' me' : ''}`}
              key={p.uid}
            >
              <div>
                <div className="stat-label">
                  {i + 1}. {p.name}
                  {p.uid === meUid ? ' (you)' : ''}
                </div>
                <div className="stat-detail">
                  {p.finished ? 'terminat' : 'încă joacă…'}
                </div>
              </div>
              <div className="stat-pts">
                {(p.average || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="level-breakdown">
        {scores.map((s, i) => (
          <div className="stat" key={i}>
            <div>
              <div className="stat-label">Runda {i + 1}</div>
              <div className="stat-detail">{game[i]?.title}</div>
            </div>
            <div className="stat-pts">{s.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <p
        className={`save-state${saveState === 'saved' ? ' ok' : ''}${
          saveState === 'error' ? ' err' : ''
        }`}
      >
        {saveState === 'saving' && '⏳ Se salvează scorul…'}
        {saveState === 'saved' && '✅ Scor adăugat în clasamentul live'}
        {saveState === 'error' && '⚠️ Nu am putut salva scorul (verifică conexiunea)'}
      </p>

      <button className="btn btn-primary btn-block btn-lg" onClick={onPlayAgain}>
        Joacă din nou →
      </button>
    </div>
  );
}
