'use client';
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'xs' | 'sm';
}

export function Badge({ children, color = '#FF6B00', variant = 'outline', size = 'xs' }: BadgeProps) {
  const sizeClass = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const styles: Record<string, React.CSSProperties> = {
    solid: { background: color, color: '#000' },
    outline: { color, borderColor: `${color}66`, border: `1px solid`, background: `${color}11` },
    ghost: { color, background: 'transparent' },
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold tracking-widest uppercase ${sizeClass}`}
      style={styles[variant]}
    >
      {children}
    </span>
  );
}
