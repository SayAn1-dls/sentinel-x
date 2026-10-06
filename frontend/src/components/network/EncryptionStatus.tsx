'use client';
import { NetworkGateway } from '@/lib/types';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface EncryptionStatusProps {
  gateways: NetworkGateway[];
}

const STATUS_COLOR: Record<NetworkGateway['status'], string> = {
  ONLINE: '#00FF88',
  OFFLINE: '#FF0033',
  DEGRADED: '#FFD700',
};

export function EncryptionStatus({ gateways }: EncryptionStatusProps) {
  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm mb-4">ENCRYPTION STATUS</h2>
      <div className="space-y-3">
        {gateways.map(gw => {
          const color = STATUS_COLOR[gw.status];
          return (
            <div key={gw.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                <div>
                  <p className="text-white/80 text-sm font-bold">{gw.name}</p>
                  <p className="text-white/40 text-xs">{gw.protocol} · {gw.encryptionBits}-bit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold" style={{ color }}>{gw.status}</p>
                <p className="text-white/40 text-xs">{gw.latency}ms</p>
              </div>
            </div>
          );
        })}
      </div>
    </SiliconCard>
  );
}
