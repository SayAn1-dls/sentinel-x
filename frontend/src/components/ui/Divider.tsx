'use client';

interface DividerProps {
  label?: string;
  color?: string;
}

export function Divider({ label, color = 'rgba(255,255,255,0.1)' }: DividerProps) {
  if (!label) {
    return <div className="my-4" style={{ height: 1, background: color }} />;
  }
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1" style={{ height: 1, background: color }} />
      <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
      <div className="flex-1" style={{ height: 1, background: color }} />
    </div>
  );
}
