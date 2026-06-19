/**
 * MatchLobby
 * The waiting room before a match starts. Shows the join code, the live list of
 * players, and — for the host — a Start button that launches the game for
 * everyone at once.
 *
 * Props:
 *   - code:      string
 *   - matchData: { hostUid, mode, status } | null
 *   - players:   Array<{ uid, name }>
 *   - isHost:    boolean
 *   - meUid:     string
 *   - busy:      boolean
 *   - onStart:   () => void
 *   - onLeave:   () => void
 */
export default function MatchLobby({
  code,
  matchData,
  players,
  isHost,
  meUid,
  busy,
  onStart,
  onLeave,
}) {
  const mode = matchData?.mode === 'ai' ? '✨ AI scenes' : '📷 Real photos';

  return (
    <div className="auth-overlay">
      <div className="auth-card lobby-card">
        <h1>Match lobby</h1>
        <p className="auth-sub">Share this code so friends can join:</p>

        <div className="match-code">{code}</div>
        <p className="lobby-mode">
          {mode} · {players.length} player{players.length === 1 ? '' : 's'}
        </p>

        <ul className="player-list">
          {players.map((p) => (
            <li key={p.uid}>
              {p.uid === matchData?.hostUid ? '👑 ' : '👤 '}
              {p.name}
              {p.uid === meUid ? ' (you)' : ''}
            </li>
          ))}
        </ul>

        {isHost ? (
          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={onStart}
            disabled={busy || players.length < 1}
          >
            Start game →
          </button>
        ) : (
          <p className="waiting">⏳ Waiting for the host to start…</p>
        )}

        <button className="auth-toggle" onClick={onLeave}>
          Leave match
        </button>
      </div>
    </div>
  );
}
