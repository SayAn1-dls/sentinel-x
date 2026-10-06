'use client';
import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const posClasses = { top: 'bottom-full left-1/2 -translate-x-1/2 mb-2', bottom: 'top-full left-1/2 -translate-x-1/2 mt-2', left: 'right-full top-1/2 -translate-y-1/2 mr-2', right: 'left-full top-1/2 -translate-y-1/2 ml-2' };

  return (
    <div className="relative inline-flex" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div
          className={`absolute ${posClasses[position]} z-50 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none`}
          style={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', color: 'rgba(255,255,255,0.8)' }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
