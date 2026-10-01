export function Progress({ value, label }: { value: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return <div aria-label={label} aria-valuenow={safe} role="progressbar" className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-linear-to-r from-brand to-accent transition-all duration-500" style={{ width: `${safe}%` }} /></div>;
}
