'use client';
import { NetworkGateway } from '@/lib/types';

interface GatewayIndicatorProps {
  gateway: NetworkGateway;
}

const STATUS_COLOR: Record<NetworkGateway['status'], string> = {
  ONLINE: '#00FF88',
  OFFLINE: '#FF0033',
  DEGRADED: '#FFD700',
};

export function GatewayIndicator({ gateway }: GatewayIndicatorProps) {
  const color = STATUS_COLOR[gateway.status];
  const isOnline = gateway.status === 'ONLINE';

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {isOnline && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: color, opacity: 0.4 }}
          />
        )}
        <div
          className="relative w-3 h-3 rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs" style={{ color }}>{gateway.name}</span>
      <span className="text-white/30 text-xs">{gateway.latency}ms</span>
    </div>
  );
}
