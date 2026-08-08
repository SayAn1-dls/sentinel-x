'use client';
import React from 'react';
import { ThreatLevel } from '@/lib/types';
import { THREAT_COLORS } from '@/lib/constants';

interface HUDPanelProps {
  children: React.ReactNode;
  title?: string;
  level?: ThreatLevel;
  live?: boolean;
  className?: string;
}

export function HUDPanel({ children, title, level, live = false, className = '' }: HUDPanelProps) {
  const accentColor = level ? THREAT_COLORS[level] : '#FF6B00';

  return (
    <div
      className={`rounded-xl border overflow-hidden ${className}`}
      style={{
        background: 'rgba(5,5,5,0.7)',
        backdropFilter: 'blur(60px)',
        WebkitBackdropFilter: 'blur(60px)',
        borderColor: `${accentColor}22`,
        boxShadow: `0 0 40px ${accentColor}08`,
      }}
    >
      {title && (
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: `${accentColor}22` }}
        >
          <span
            className="text-xs font-black tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            {title}
          </span>
          {live && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: accentColor, opacity: 0.6 }}>LIVE</span>
            </div>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
