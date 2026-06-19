import { useState } from 'react';

/**
 * NameGate
 * Full-screen overlay shown until the player picks a display name. The name is
 * what appears on the shared Firestore leaderboard.
 *
 * Props:
 *   - onSubmit: (name: string) => void
 */
export default function NameGate({ onSubmit }) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();

  function submit(e) {
    e.preventDefault();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,10,12,0.92)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: '#1f1f24',
          border: '1px solid #333',
          borderRadius: 14,
          padding: '2rem',
          width: 'min(92vw, 420px)',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem' }}>
          🌍🕰️ Historical Guesser
        </h1>
        <p style={{ marginTop: 0, opacity: 0.75 }}>
          Guess the place and the year. Your score lands on the live leaderboard.
        </p>
        <input
          autoFocus
          value={value}
          maxLength={40}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your name"
          style={{
            width: '100%',
            padding: '0.7rem 0.9rem',
            margin: '0.75rem 0',
            borderRadius: 8,
            border: '1px solid #444',
            background: '#111',
            color: '#fff',
            font: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        <button type="submit" disabled={!trimmed} style={{ width: '100%' }}>
          Start playing
        </button>
      </form>
    </div>
  );
}
