'use client';
import { useEffect, useRef, useState } from 'react';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  delay?: number;
  className?: string;
}

export function SearchBar({ placeholder = 'SEARCH...', onSearch, delay = 300, className = '' }: SearchBarProps) {
  const [value, setValue] = useState('');
  const debouncedSearch = useRef(debounce(onSearch, delay));

  useEffect(() => {
    debouncedSearch.current(value);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">⌕</div>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-white/80 text-xs tracking-widest uppercase placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-colors"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
