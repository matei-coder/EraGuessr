import { useState } from 'react';
import { LEVELS_PER_GAME } from '../lib/catalog.js';

/**
 * Home — ChronoMap landing hero.
 * Pick a mode (real photos / AI scenes), then play solo, host a match, or join.
 *
 * Props:
 *   - onSolo:   (mode: 'real'|'ai') => void
 *   - onCreate: (mode: 'real'|'ai') => void
 *   - onJoin:   (code: string) => void
 *   - busy:     boolean
 *   - error:    string
 */
export default function Home({ onSolo, onCreate, onJoin, busy, error }) {
  const [mode, setMode] = useState('ai');
  const [code, setCode] = useState('');

  return (
    <div className="home-hero">
      <div className="home-topbar">
        <span className="home-wordmark">
          <span aria-hidden="true">🌐</span>
          Chrono<span className="brand-accent">Map</span>
        </span>
        <span className="home-energy">⚡ Energii gratuite: 3/3</span>
      </div>

      <div className="home-inner">
        <span className="home-badge">⚡ Joc de geografie temporală</span>

        <h1 className="home-title">
          Ghicește
          <br />
          <span className="lt-gold">Epoca</span>
          <br />
          &amp; <span className="lt-gold">Locul</span>
        </h1>

        <p className="home-sub">
          Analizează imagini istorice fascinante și ghicește în ce an și unde au
          fost surprinse. Fiecare rundă — o epocă nouă de descoperit.
        </p>

        <div className="home-panel">
          <div className="home-stats">
            <span>🕒 90s / rundă</span>
            <span className="sep" />
            <span>🎯 {LEVELS_PER_GAME} Runde</span>
          </div>

          <div className="home-mode-row mode-row">
            <button
              className={`mode-pill${mode === 'ai' ? ' active' : ''}`}
              onClick={() => setMode('ai')}
              type="button"
            >
              ✨ Scene AI
            </button>
            <button
              className={`mode-pill${mode === 'real' ? ' active' : ''}`}
              onClick={() => setMode('real')}
              type="button"
            >
              📷 Poze reale
            </button>
          </div>

          <button
            className="btn btn-primary btn-block btn-lg home-cta"
            onClick={() => onSolo(mode)}
            disabled={busy}
          >
            → Pornește Aventura
          </button>

          <div className="home-secondary">
            <button
              className="btn"
              onClick={() => onCreate(mode)}
              disabled={busy}
            >
              👥 Creează meci
            </button>
          </div>

          <form
            className="home-join"
            onSubmit={(e) => {
              e.preventDefault();
              onJoin(code.trim().toUpperCase());
            }}
          >
            <input
              className="auth-input code-input"
              placeholder="Cod meci"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoComplete="off"
            />
            <button className="btn" type="submit" disabled={busy || !code.trim()}>
              Intră
            </button>
          </form>

          {error && <p className="auth-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
