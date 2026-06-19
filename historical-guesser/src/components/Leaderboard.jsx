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
    <div
      style={{
        width: 240,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        borderRadius: 10,
        padding: '0.75rem 0.9rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        fontSize: '0.9rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <strong>🏆 Leaderboard</strong>
        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>live</span>
      </div>

      {rows.length === 0 ? (
        <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>
          No scores yet — be the first!
        </div>
      ) : (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {rows.map((p, i) => {
            const isMe = meId && p.id === meId;
            return (
              <li
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '0.2rem 0.4rem',
                  borderRadius: 6,
                  background: isMe ? 'rgba(45,108,223,0.45)' : 'transparent',
                  fontWeight: isMe ? 700 : 400,
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {i + 1}. {p.name}
                </span>
                <span style={{ opacity: 0.9 }}>
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
