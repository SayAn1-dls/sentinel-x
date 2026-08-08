'use client';
import { AuthGate } from '@/components/auth/AuthGate';
import { ForensicHUD } from '@/components/hud/ForensicHUD';
import { EncryptionStatus } from '@/components/network/EncryptionStatus';
import { GatewayIndicator } from '@/components/network/GatewayIndicator';
import { SecurityBadge } from '@/components/network/SecurityBadge';
import { PacketMonitor } from '@/components/network/PacketMonitor';
import { NetworkStatus } from '@/components/hud/NetworkStatus';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { RiskMeter } from '@/components/ui/RiskMeter';

function NetworkContent() {
  const { gateways, healthScore, online } = useNetwork();

  return (
    <div className="min-h-screen" data-testid="network-page">
      <ForensicHUD />
      <main className="pt-16 px-6 pb-8 max-w-7xl mx-auto">
        <div className="py-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-orange-500 tracking-widest uppercase">NETWORK SECURITY</h1>
            <p className="text-white/40 text-sm mt-1">Encrypted gateway monitoring · TLS 1.3 enforced</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <SiliconCard className="flex flex-col items-center justify-center py-8">
            <RiskMeter score={healthScore} size={130} label="NET HEALTH" />
          </SiliconCard>
          <NetworkStatus />
          <SiliconCard>
            <h3 className="text-white/50 text-xs tracking-widest uppercase mb-4">ACTIVE GATEWAYS</h3>
            <div className="space-y-3">
              {online.map(gw => <GatewayIndicator key={gw.id} gateway={gw} />)}
            </div>
          </SiliconCard>
          <SiliconCard>
            <h3 className="text-white/50 text-xs tracking-widest uppercase mb-4">PROTOCOLS</h3>
            <div className="space-y-2">
              {gateways.map(gw => <SecurityBadge key={gw.id} protocol={gw.protocol} bits={gw.encryptionBits} />)}
            </div>
          </SiliconCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EncryptionStatus gateways={gateways} />
          <PacketMonitor />
        </div>
      </main>
    </div>
  );
}

export default function NetworkPage() {
  return (
    <AuthGate>
      <NetworkContent />
    </AuthGate>
  );
}
