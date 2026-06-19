import { useEffect, useMemo, useState } from 'react';
import Panorama360 from './components/Panorama360.jsx';
import GuessMap from './components/GuessMap.jsx';
import TimelineSlider from './components/TimelineSlider.jsx';
import ScoreBoard from './components/ScoreBoard.jsx';
import FinalSummary from './components/FinalSummary.jsx';
import Home from './components/Home.jsx';
import MatchLobby from './components/MatchLobby.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import AuthGate from './components/AuthGate.jsx';
import {
  buildGame,
  gameFromIds,
  LEVELS_PER_GAME,
  START_YEAR,
} from './lib/catalog.js';
import { computeRoundScore, averageScore } from './lib/scoring.js';
import { submitScore, playerId } from './lib/leaderboard.js';
import {
  createMatch,
  joinMatch,
  startMatch,
  reportProgress,
  finishMatch,
  leaveMatch,
  subscribeMatch,
  subscribePlayers,
} from './lib/match.js';
import {
  generateSceneImage,
  generateImageDescription,
  generateRoast,
} from './lib/ai.js';
import { onAuth, signOutUser, displayNameFor } from './lib/auth.js';

// How many times to silently retry a failed AI generation before giving up and
// showing a manual "Regenerate" button. Total attempts = 1 + this.
const AI_RETRIES = 2;

export default function App() {
  // Auth: `user` is undefined while we wait for Firebase, then a user or null.
  const [user, setUser] = useState(undefined);
  useEffect(() => onAuth(setUser), []);
  const name = displayNameFor(user);
  const myUid = user?.uid;

  // Top-level screen: 'home' (menu) | 'matchLobby' (waiting room) | 'game'.
  const [screen, setScreen] = useState('home');
  const [busy, setBusy] = useState(false); // home/lobby action in flight
  const [homeError, setHomeError] = useState('');

  // Match context (null for solo play).
  const [match, setMatch] = useState(null); // { code, isHost }
  const [matchData, setMatchData] = useState(null); // live match doc
  const [matchPlayers, setMatchPlayers] = useState([]); // live players

  // The current game: a fixed list of LEVELS_PER_GAME distinct locations.
  const [game, setGame] = useState(() => buildGame());
  const [level, setLevel] = useState(0); // 0-based index into `game`
  const [levelScores, setLevelScores] = useState([]); // per-level totals
  // phase within the game screen: 'playing' | 'levelResult' | 'final'
  const [phase, setPhase] = useState('playing');

  const [guess, setGuess] = useState(null);
  const [guessYear, setGuessYear] = useState(START_YEAR);
  const [saveState, setSaveState] = useState('idle'); // idle|saving|saved|error
  const [ai, setAi] = useState({ url: null, loading: false, error: null });
  const [desc, setDesc] = useState({ text: null, loading: false, error: null });
  const [fact, setFact] = useState({ text: null, loading: false, error: null });
  // Game mode for the current game ('real' photos vs 'ai' generated scenes).
  const [useAi, setUseAi] = useState(false);

  const current = game[level];

  const yearBounds = useMemo(
    () => current?.yearRange ?? { min: -3000, max: new Date().getFullYear() },
    [current]
  );

  // In AI mode we show ONLY the generated image (no fallback to the real photo).
  // In real mode we show the real photo, but still honor a manual preview.
  const sceneSrc = useAi ? ai.url : ai.url || current?.image || null;

  // ── Match realtime subscriptions ──────────────────────────────────
  useEffect(() => {
    if (!match?.code) {
      setMatchData(null);
      setMatchPlayers([]);
      return;
    }
    const unsubMatch = subscribeMatch(match.code, setMatchData);
    const unsubPlayers = subscribePlayers(match.code, setMatchPlayers);
    return () => {
      unsubMatch();
      unsubPlayers();
    };
  }, [match?.code]);

  // When the host starts the match, every client in the lobby starts together.
  useEffect(() => {
    if (screen === 'matchLobby' && matchData?.status === 'playing') {
      beginGame({ mode: matchData.mode, ids: matchData.levelIds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, matchData?.status]);

  // ── Game lifecycle ────────────────────────────────────────────────
  // Begin a fresh game. With `ids` (a match) every player gets the same levels;
  // without, a random solo game.
  function beginGame({ mode, ids }) {
    setUseAi(mode === 'ai');
    setGame(ids ? gameFromIds(ids) : buildGame());
    setLevel(0);
    setLevelScores([]);
    setGuess(null);
    setGuessYear(START_YEAR);
    setSaveState('idle');
    setDesc({ text: null, loading: false, error: null });
    setFact({ text: null, loading: false, error: null });
    setAi({ url: null, loading: false, error: null });
    setPhase('playing');
    setScreen('game');
  }

  // Generate a period-accurate scene for `loc`, retrying a few times before
  // surfacing an error + manual retry. Never falls back to the real photo.
  async function generateFor(loc, attempt = 0) {
    if (!loc) return;
    setAi({ url: null, loading: true, error: null });
    try {
      const url = await generateSceneImage(loc);
      setAi({ url, loading: false, error: null });
    } catch (err) {
      if (attempt < AI_RETRIES) {
        return generateFor(loc, attempt + 1);
      }
      console.error('AI generation failed:', err);
      setAi({
        url: null,
        loading: false,
        error: err?.message || 'Generation failed',
      });
    }
  }

  // When AI mode is on, ensure the current level always has a generated scene.
  useEffect(() => {
    if (screen !== 'game' || phase !== 'playing') return;
    if (useAi && !ai.url && !ai.loading && !ai.error) {
      generateFor(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useAi, screen, phase, level]);

  function handleSubmit() {
    if (!guess) return;

    const { total, distanceKm } = computeRoundScore(guess, guessYear, current);
    const newScores = [...levelScores, total];
    setLevelScores(newScores);
    setPhase('levelResult');

    // Live in-match standings: report progress after each level.
    if (match?.code) {
      reportProgress(match.code, {
        scores: newScores,
        currentLevel: newScores.length,
        average: averageScore(newScores),
      }).catch((err) => console.error('reportProgress failed:', err));
    }

    setFact({ text: null, loading: true, error: null });
    generateRoast({ actual: current, guess, distanceKm })
      .then((text) => setFact({ text, loading: false, error: null }))
      .catch((err) => {
        console.error('Roast generation failed:', err);
        setFact({ text: null, loading: false, error: err?.message || 'Failed' });
      });
  }

  async function handleNext() {
    const isLast = level >= LEVELS_PER_GAME - 1;
    if (!isLast) {
      setLevel((l) => l + 1);
      setGuess(null);
      setGuessYear(START_YEAR);
      setPhase('playing');
      setDesc({ text: null, loading: false, error: null });
      setFact({ text: null, loading: false, error: null });
      setAi({ url: null, loading: false, error: null });
      return;
    }

    // Last level done: compute the average, save it once.
    setPhase('final');
    const average = averageScore(levelScores);

    if (match?.code) {
      finishMatch(match.code, { scores: levelScores, average }).catch((err) =>
        console.error('finishMatch failed:', err)
      );
    }

    setSaveState('saving');
    try {
      await submitScore(name, average);
      setSaveState('saved');
    } catch (err) {
      console.error('Failed to save score:', err);
      setSaveState('error');
    }
  }

  // ── Home actions ──────────────────────────────────────────────────
  function handleSolo(mode) {
    setMatch(null);
    beginGame({ mode });
  }

  async function handleCreate(mode) {
    setBusy(true);
    setHomeError('');
    try {
      const code = await createMatch({ mode });
      setMatch({ code, isHost: true });
      setScreen('matchLobby');
    } catch (err) {
      console.error('createMatch failed:', err);
      setHomeError(err?.message || 'Could not create the match.');
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(code) {
    if (!code) return;
    setBusy(true);
    setHomeError('');
    try {
      await joinMatch(code);
      setMatch({ code, isHost: false });
      setScreen('matchLobby');
    } catch (err) {
      console.error('joinMatch failed:', err);
      setHomeError(err?.message || 'Could not join the match.');
    } finally {
      setBusy(false);
    }
  }

  async function handleStartMatch() {
    if (!match?.code) return;
    setBusy(true);
    try {
      await startMatch(match.code);
      // The status subscription transitions us (and everyone) into the game.
    } catch (err) {
      console.error('startMatch failed:', err);
      setHomeError(err?.message || 'Could not start the match.');
    } finally {
      setBusy(false);
    }
  }

  function goHome() {
    if (match?.code) leaveMatch(match.code);
    setMatch(null);
    setScreen('home');
    setHomeError('');
  }

  async function handleDescribe() {
    setDesc({ text: null, loading: true, error: null });
    try {
      const text = await generateImageDescription(current);
      setDesc({ text, loading: false, error: null });
    } catch (err) {
      console.error('Description generation failed:', err);
      setDesc({ text: null, loading: false, error: err?.message || 'Failed' });
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  if (user === undefined) {
    return <div className="app-loading">Loading…</div>;
  }
  if (!user) return <AuthGate />;

  if (screen === 'home') {
    return (
      <Home
        onSolo={handleSolo}
        onCreate={handleCreate}
        onJoin={handleJoin}
        busy={busy}
        error={homeError}
      />
    );
  }

  if (screen === 'matchLobby') {
    return (
      <MatchLobby
        code={match?.code}
        matchData={matchData}
        players={matchPlayers}
        isHost={!!match?.isHost}
        meUid={myUid}
        busy={busy}
        onStart={handleStartMatch}
        onLeave={goHome}
      />
    );
  }

  return (
    <div className="app">
      {/* Panorama stage with floating overlays */}
      <div className="stage">
        <Panorama360 src={sceneSrc} loading={ai.loading} />

        <div className="stage-top">
          <div className="chip brand">
            <span aria-hidden="true">🌐</span>
            <span className="brand-text">
              Chrono<span className="brand-accent">Map</span>
            </span>
          </div>
          <div className="chip level-chip">
            Runda {Math.min(level + 1, LEVELS_PER_GAME)} din {LEVELS_PER_GAME}
            {match?.code ? ` · #${match.code}` : ''}
          </div>
          <div className="chip userbar">
            <span className="user-name">👤 {name}</span>
            <button className="btn-link" onClick={signOutUser}>
              Ieși
            </button>
          </div>
        </div>

        {phase !== 'final' && (
          <div className="stage-lb">
            <Leaderboard meId={playerId(name)} />
          </div>
        )}

        {/* When AI is on but generation failed, prompt a manual retry. */}
        {useAi && ai.error && !ai.loading && (
          <div className="ai-blocker">
            <p className="toast-error">Generation failed: {ai.error}</p>
            <button
              className="btn btn-primary"
              onClick={() => generateFor(current)}
            >
              ✨ Regenerate
            </button>
          </div>
        )}

        <div className="ai-actions">
          <button
            className="btn btn-glass"
            onClick={() => generateFor(current)}
            disabled={ai.loading}
          >
            {ai.loading
              ? '✨ Se generează…'
              : ai.url
                ? '✨ Regenerează'
                : '✨ Generează scena'}
          </button>
          <button
            className="btn btn-glass"
            onClick={handleDescribe}
            disabled={desc.loading}
          >
            {desc.loading ? '📝 Se gândește…' : '📝 Descrie scena'}
          </button>

          <span className="mode-badge">
            {useAi ? '✨ Scene AI' : '📷 Poze reale'}
          </span>
        </div>

        {(desc.text || desc.error) && (
          <div className={`desc-pop${desc.error ? ' is-error' : ''}`}>
            {desc.error || desc.text}
          </div>
        )}
      </div>

      {/* Map + controls rail */}
      <div className="rail">
        <div className="card map-card">
          <GuessMap
            guess={guess}
            onPick={setGuess}
            disabled={phase !== 'playing'}
            actual={phase !== 'playing' ? current : null}
          />
        </div>

        <div className="card panel">
          {phase === 'final' ? (
            <FinalSummary
              game={game}
              scores={levelScores}
              saveState={saveState}
              standings={match?.code ? matchPlayers : null}
              meUid={myUid}
              onPlayAgain={goHome}
            />
          ) : phase === 'levelResult' ? (
            <ScoreBoard
              guess={guess}
              guessYear={guessYear}
              actual={current}
              fact={fact}
              level={level}
              levelCount={LEVELS_PER_GAME}
              onNext={handleNext}
            />
          ) : (
            <div style={{ padding: '1.1rem 1.2rem 1.2rem' }}>
              <TimelineSlider
                value={guessYear}
                min={yearBounds.min}
                max={yearBounds.max}
                onChange={setGuessYear}
              />
              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handleSubmit}
                disabled={!guess || (useAi && !ai.url)}
                style={{ marginTop: '0.9rem' }}
              >
                {useAi && !ai.url
                  ? '✨ Se așteaptă scena generată…'
                  : guess
                    ? 'Confirmă Locația și Anul'
                    : '📍 Apasă pe hartă pentru a ghici'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
