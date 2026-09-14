export function NameAutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
  listId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  listId: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-secondary">{label}</span>
      <input
        type="text"
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-tap w-full rounded-card border border-hairline bg-surface px-3 text-base text-ink"
      />
      <datalist id={listId}>
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </label>
  );
}
