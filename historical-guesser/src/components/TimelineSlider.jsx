/**
 * TimelineSlider
 * A slider for guessing the historical year of the panorama.
 *
 * Props:
 *   - value: number          -> current guessed year
 *   - min: number            -> earliest selectable year (negative = BCE)
 *   - max: number            -> latest selectable year
 *   - onChange: (year) => void
 *   - disabled: boolean
 */
export default function TimelineSlider({
  value,
  min = -3000,
  max = new Date().getFullYear(),
  onChange,
  disabled = false,
}) {
  const label = formatYear(value);

  return (
    <div className="timeline">
      <div className="timeline-head">
        <span>{formatYear(min)}</span>
        <span className="timeline-year">{label}</span>
        <span>{formatYear(max)}</span>
      </div>
      <input
        className="slider"
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function formatYear(year) {
  if (year < 0) return `${Math.abs(year)} î.Hr.`;
  return `${year}`;
}
