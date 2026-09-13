export function Placeholder({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="rounded-card border border-hairline bg-surface p-card">
      <h1 className="text-lg font-medium text-ink">{name}</h1>
      <p className="mt-1 text-secondary">{description}</p>
    </div>
  );
}
