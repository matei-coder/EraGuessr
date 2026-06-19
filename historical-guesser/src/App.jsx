import { useMemo, useState } from 'react';
import PanoramaViewer from './components/PanoramaViewer.jsx';
import GuessMap from './components/GuessMap.jsx';
import TimelineSlider from './components/TimelineSlider.jsx';
import ScoreBoard from './components/ScoreBoard.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import NameGate from './components/NameGate.jsx';
import dataset from './data/dataset.json';
import { computeRoundScore } from './lib/scoring.js';
import { submitScore, playerId } from './lib/leaderboard.js';
import { generateSceneImage } from './lib/ai.js';

const NAME_KEY = 'hg_player_name';

function pickRandom(locations, excludeId) {
  const pool = locations.filter((l) => l.id !== excludeId);
  const list = pool.length ? pool : locations;
  return list[Math.floor(Math.random() * list.length)];
}

function midYear(location) {
  const b = location?.yearRange ?? { min: -3000, max: new Date().getFullYear() };
  return Math.round((b.min + b.max) / 2);
}

export default function App() {
  const locations = dataset.locations;

  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [current, setCurrent] = useState(() => pickRandom(locations));
  const [guess, setGuess] = useState(null);
  // `current` is already bound from the previous hook, so the slider starts
  // centered on the first location's own year range.
  const [guessYear, setGuessYear] = useState(() => midYear(current));
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle|saving|saved|error
  const [ai, setAi] = useState({ url: null, loading: false, error: null });

  // Year bounds come from the location if provided, else a sensible default.
  const yearBounds = useMemo(
    () => current?.yearRange ?? { min: -3000, max: new Date().getFullYear() },
    [current]
  );

  function handleName(n) {
    localStorage.setItem(NAME_KEY, n);
    setName(n);
  }

  async function handleSubmit() {
    if (!guess) return;
    setSubmitted(true);

    const { total } = computeRoundScore(guess, guessYear, current);
    setSaveState('saving');
    try {
      await submitScore(name, total);
      setSaveState('saved');
    } catch (err) {
      console.error('Failed to save score:', err);
      setSaveState('error');
    }
  }

  function handleNext() {
    const next = pickRandom(locations, current?.id);
    setCurrent(next);
    setGuess(null);
    setGuessYear(midYear(next));
    setSubmitted(false);
    setSaveState('idle');
    setAi({ url: null, loading: false, error: null });
  }

  async function handleGenerate() {
    setAi((a) => ({ ...a, loading: true, error: null }));
    try {
      const url = await generateSceneImage(current);
      setAi({ url, loading: false, error: null });
    } catch (err) {
      console.error('AI generation failed:', err);
      setAi({
        url: null,
        loading: false,
        error: err?.message || 'Generation failed',
      });
    }
  }

  if (!name) return <NameGate onSubmit={handleName} />;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gridTemplateRows: '1fr auto',
        height: '100vh',
      }}
    >
      {/* Panorama (top-left, spans both rows) */}
      <div style={{ gridRow: '1 / span 2', position: 'relative' }}>
        <PanoramaViewer src={ai.url} />

        {/* Title chip */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(0,0,0,0.6)',
            padding: '0.4rem 0.8rem',
            borderRadius: 6,
          }}
        >
          Historical Guesser
        </div>

        {/* Live leaderboard */}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <Leaderboard meId={playerId(name)} />
        </div>

        {/* AI scene generation */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button onClick={handleGenerate} disabled={ai.loading}>
            {ai.loading
              ? 'Generating…'
              : ai.url
                ? '✨ Regenerate'
                : '✨ Generate scene with AI'}
          </button>
          {ai.error && (
            <span
              style={{
                color: '#ffb4b4',
                background: 'rgba(0,0,0,0.7)',
                padding: '0.3rem 0.6rem',
                borderRadius: 6,
                fontSize: '0.85rem',
                maxWidth: 320,
              }}
            >
              {ai.error}
            </span>
          )}
        </div>
      </div>

      {/* Map (top-right) */}
      <div style={{ minHeight: 0 }}>
        <GuessMap guess={guess} onPick={setGuess} disabled={submitted} />
      </div>

      {/* Controls / result (bottom-right) */}
      <div style={{ background: '#222', borderTop: '1px solid #333' }}>
        {submitted ? (
          <ScoreBoard
            guess={guess}
            guessYear={guessYear}
            actual={current}
            saveState={saveState}
            onNext={handleNext}
          />
        ) : (
          <>
            <TimelineSlider
              value={guessYear}
              min={yearBounds.min}
              max={yearBounds.max}
              onChange={setGuessYear}
            />
            <div style={{ padding: '0 1rem 1rem' }}>
              <button
                onClick={handleSubmit}
                disabled={!guess}
                style={{ width: '100%' }}
              >
                {guess ? 'Submit guess' : 'Click the map to place a guess'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
