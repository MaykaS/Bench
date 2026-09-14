const VALUES = [1, 2, 3, 4, 5];

export function ScoreTapInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div>
      <span className="mb-1 block text-sm text-secondary">{label}</span>
      <div className="flex gap-2">
        {VALUES.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : n)}
              className={`min-h-tap flex-1 rounded-card border text-base ${
                selected
                  ? "border-accent bg-accent text-surface"
                  : "border-hairline bg-surface text-ink"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
