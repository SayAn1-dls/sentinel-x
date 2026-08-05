'use client';
import React from 'react';

type Variant = 'orange' | 'red' | 'cyan' | 'green' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  orange: { background: '#FF6B00', color: '#000', boxShadow: '0 0 20px rgba(255,107,0,0.5)' },
  red: { background: '#FF0033', color: '#fff', boxShadow: '0 0 20px rgba(255,0,51,0.5)' },
  cyan: { background: '#00CFFF', color: '#000', boxShadow: '0 0 20px rgba(0,207,255,0.5)' },
  green: { background: '#00FF88', color: '#000', boxShadow: '0 0 20px rgba(0,255,136,0.5)' },
  ghost: { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' },
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base',
};

export function NeonButton({ variant = 'orange', size = 'md', children, className = '', ...props }: NeonButtonProps) {
  return (
    <button
      className={`font-bold tracking-widest uppercase rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${SIZE_CLASSES[size]} ${className}`}
      style={VARIANT_STYLES[variant]}
      {...props}
    >
      {children}
    </button>
  );
}
