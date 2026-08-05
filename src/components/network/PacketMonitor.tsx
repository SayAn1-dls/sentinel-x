'use client';
import { useState, useEffect } from 'react';
import { SiliconCard } from '@/components/ui/SiliconCard';

interface PacketSample {
  ts: number;
  bytes: number;
  protocol: string;
  encrypted: boolean;
}

function generatePacket(): PacketSample {
  const protocols = ['TLS', 'HTTPS', 'WSS', 'gRPC'];
  return {
    ts: Date.now(),
    bytes: Math.floor(Math.random() * 8192) + 64,
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    encrypted: Math.random() > 0.05,
  };
}

export function PacketMonitor() {
  const [packets, setPackets] = useState<PacketSample[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPackets(prev => [generatePacket(), ...prev.slice(0, 14)]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <SiliconCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm">PACKET MONITOR</h2>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-xs">LIVE</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {packets.map((p, i) => (
          <div key={p.ts + i} className="flex items-center justify-between text-xs opacity-100" style={{ opacity: 1 - i * 0.06 }}>
            <span className="font-mono text-white/50">{p.protocol}</span>
            <span className="text-white/40">{p.bytes}B</span>
            <span className={p.encrypted ? 'text-green-400' : 'text-red-400'}>
              {p.encrypted ? '🔒 ENC' : '⚠ PLAIN'}
            </span>
          </div>
        ))}
      </div>
    </SiliconCard>
  );
}
