'use client';
import React from 'react';

interface SiliconCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'orange' | 'red' | 'cyan' | 'green' | 'none';
  padding?: string;
}

const GLOW_MAP = {
  orange: '0 0 30px rgba(255,107,0,0.3), 0 0 60px rgba(255,107,0,0.1)',
  red: '0 0 30px rgba(255,0,51,0.3), 0 0 60px rgba(255,0,51,0.1)',
  cyan: '0 0 30px rgba(0,207,255,0.3), 0 0 60px rgba(0,207,255,0.1)',
  green: '0 0 30px rgba(0,255,136,0.3), 0 0 60px rgba(0,255,136,0.1)',
  none: 'none',
};

export function SiliconCard({ children, className = '', glow = 'none', padding = 'p-6' }: SiliconCardProps) {
  return (
    <div
      className={`relative rounded-xl border border-white/10 ${padding} ${className}`}
      style={{
        background: 'rgba(10, 10, 10, 0.6)',
        backdropFilter: 'blur(60px)',
        WebkitBackdropFilter: 'blur(60px)',
        boxShadow: glow !== 'none' ? GLOW_MAP[glow] : '0 4px 32px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  );
}
