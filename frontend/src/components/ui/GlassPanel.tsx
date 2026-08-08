'use client';
import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  border?: boolean;
}

export function GlassPanel({ children, className = '', blur = 60, opacity = 0.08, border = true }: GlassPanelProps) {
  return (
    <div
      className={`rounded-2xl ${border ? 'border border-white/10' : ''} ${className}`}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      }}
    >
      {children}
    </div>
  );
}
