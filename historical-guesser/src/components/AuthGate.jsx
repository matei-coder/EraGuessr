import { useState } from 'react';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  friendlyAuthError,
} from '../lib/auth.js';

/**
 * AuthGate
 * Full-screen sign-in overlay shown until the player authenticates. Supports
 * Google sign-in and email/password (with a sign-in / create-account toggle).
 * On success, App's auth listener picks up the user — no onSubmit needed.
 */
export default function AuthGate() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(fn) {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      console.error('Auth error:', err);
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    run(() =>
      mode === 'signup'
        ? signUpWithEmail(email.trim(), password)
        : signInWithEmail(email.trim(), password)
    );
  }

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <h1>🌍 EraGuessr</h1>
        <p className="auth-sub">
          {mode === 'signup' ? 'Create an account to play' : 'Sign in to play'}
        </p>

        {/* Google */}
        <button
          className="btn btn-google"
          onClick={() => run(signInWithGoogle)}
          disabled={busy}
        >
          Continue with Google
        </button>

        <div className="auth-divider">or</div>

        {/* Email / password */}
        <form onSubmit={handleEmailSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
          />
          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={busy}
          >
            {busy
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}

        <button
          className="auth-toggle"
          onClick={() => {
            setMode((m) => (m === 'signup' ? 'signin' : 'signup'));
            setError('');
          }}
        >
          {mode === 'signup'
            ? 'Already have an account? Sign in'
            : 'New here? Create an account'}
        </button>
      </div>
    </div>
  );
}
