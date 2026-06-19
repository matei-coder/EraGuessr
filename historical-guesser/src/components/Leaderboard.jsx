import { useEffect, useState } from 'react';
import { subscribeLeaderboard } from '../lib/leaderboard.js';

/**
 * Leaderboard
 * Live top-10 panel. Re-renders automatically whenever any player's score
 * changes in Firestore (onSnapshot). Highlights the current player.
 *
 * Props:
 *   - meId: string | null  -> playerId of the current player (for highlight)
 */
export default function Leaderboard({ meId }) {
  const [rows, setRows] = useState([]);

  useEffect(() => subscribeLeaderboard(setRows), []);

  return (
    <div className="lb">
      <div className="lb-head">
        <strong>🏆 Leaderboard</strong>
        <span className="live">live</span>
      </div>

      {rows.length === 0 ? (
        <div className="lb-empty">No scores yet — be the first!</div>
      ) : (
        <ol className="lb-list">
          {rows.map((p, i) => {
            const isMe = meId && p.id === meId;
            return (
              <li key={p.id} className={`lb-row${isMe ? ' me' : ''}`}>
                <span className="lb-name">
                  <span className="lb-rank">{i + 1}.</span>
                  {p.name}
                </span>
                <span className="lb-score">
                  {Number(p.total || 0).toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
