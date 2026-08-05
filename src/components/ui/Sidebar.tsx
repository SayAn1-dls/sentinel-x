'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_LINKS } from '@/lib/constants';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-16 bottom-0 w-16 border-r border-white/5 flex flex-col items-center py-6 gap-4 z-40"
      style={{ background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(60px)' }}
    >
      {SIDEBAR_LINKS.map(link => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            title={link.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-110 ${
              isActive ? 'bg-orange-500/20 border border-orange-500/50' : 'border border-transparent hover:border-white/10'
            }`}
          >
            {link.icon}
          </Link>
        );
      })}
    </aside>
  );
}
