'use client';
import { useEffect, useState } from 'react';

const ROWS = [
  { id: '8A2F', from: 'Priya M.', to: 'Grocer & Co', amount: '₹2,180', flag: false },
  { id: 'C91D', from: 'Acct 4471', to: 'Acct 9902', amount: '₹1,28,500', flag: true, note: 'loops back in 3 hops' },
  { id: 'F4E7', from: 'Rohan K.', to: 'Metro Card', amount: '₹920', flag: false },
  { id: 'B28A', from: 'Acct 1180', to: 'Acct 7713', amount: '₹2,56,000', flag: true, note: '14 logins, 9 IPs, 2 min' },
  { id: 'A77C', from: 'Ananya S.', to: 'Rent', amount: '₹15,340', flag: false },
];

export default function Ledger() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % ROWS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative rotate-[1.5deg] rounded-sm bg-paper text-ink shadow-[0_40px_80px_-20px_rgba(0,0,0,.7)]">
      <div className="flex items-baseline justify-between border-b border-ink/15 px-6 pt-5 pb-3">
        <span className="font-display text-xl italic">Today&apos;s ledger</span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink/50">live</span>
      </div>
      <ul className="px-6 py-2">
        {ROWS.map((r, i) => (
          <li
            key={r.id}
            className={`relative grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-dashed border-ink/15 py-3 transition-colors duration-500 last:border-0 ${
              i === active ? 'text-ink' : 'text-ink/55'
            }`}
          >
            <span className="font-mono text-[11px] text-ink/40">#{r.id}</span>
            <span className="truncate text-sm">
              {r.from} <span className="text-ink/35">→</span> {r.to}
              {r.flag && i === active && (
                <span className="mt-0.5 block font-mono text-[11px] text-accent-dark">{r.note}</span>
              )}
            </span>
            <span className={`font-mono text-sm font-bold ${r.flag ? 'text-accent-dark line-through decoration-2' : ''}`}>
              {r.amount}
            </span>
          </li>
        ))}
      </ul>
      <div className="absolute -right-4 -top-5 rotate-[8deg] rounded-full border-2 border-accent px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-accent bg-ink">
        2 held
      </div>
    </div>
  );
}
