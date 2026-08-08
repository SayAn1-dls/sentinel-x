'use client';

interface LoadingPulseProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZES = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-16 h-16' };

export function LoadingPulse({ color = '#FF6B00', size = 'md', label }: LoadingPulseProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${SIZES[size]}`}>
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: color, opacity: 0.3 }}
        />
        <div
          className="relative rounded-full w-full h-full"
          style={{ background: color }}
        />
      </div>
      {label && (
        <span className="text-xs tracking-widest uppercase animate-pulse" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}
