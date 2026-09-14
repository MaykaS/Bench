const SEGMENTS = [1, 2, 3, 4, 5];

export function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const isLow = value != null && value <= 2;

  return (
    <div>
      <div className={`mb-1 text-xs ${isLow ? "text-flag-text" : "text-secondary"}`}>
        {label}
      </div>
      <div className="flex gap-0.5" role="img" aria-label={label + ": " + (value == null ? "not scored" : value + " out of 5")}>
        {SEGMENTS.map((n) => {
          const filled = value != null && n <= value;
          return (
            <span
              key={n}
              className={`h-1.5 flex-1 rounded-full ${
                filled ? (isLow ? "bg-flag-text" : "bg-accent") : "bg-hairline"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
