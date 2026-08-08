'use client';
import { NetworkProtocol } from '@/lib/types';

interface SecurityBadgeProps {
  protocol: NetworkProtocol;
  bits: number;
}

const PROTOCOL_COLORS: Record<NetworkProtocol, string> = {
  TLS_1_3: '#00FF88',
  TLS_1_2: '#00CFFF',
  ENCRYPTED: '#FFD700',
  PLAIN: '#FF0033',
};

export function SecurityBadge({ protocol, bits }: SecurityBadgeProps) {
  const color = PROTOCOL_COLORS[protocol];
  const isSecure = protocol !== 'PLAIN';

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase"
      style={{ color, borderColor: `${color}44`, background: `${color}11` }}
    >
      <span>{isSecure ? '🔒' : '⚠️'}</span>
      <span>{protocol}</span>
      <span className="text-white/40">·</span>
      <span>{bits}-bit</span>
    </div>
  );
}
