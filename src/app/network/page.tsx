'use client';
import { ForensicHUD } from '@/components/hud/ForensicHUD';
import { EncryptionStatus } from '@/components/network/EncryptionStatus';
import { GatewayIndicator } from '@/components/network/GatewayIndicator';
import { SecurityBadge } from '@/components/network/SecurityBadge';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { RiskMeter } from '@/components/ui/RiskMeter';

export default function NetworkPage() {
  const { gateways, healthScore, avgLatency, online } = useNetwork();

  return (
    <div className="min-h-screen">
      <ForensicHUD />
      <main className="pt-16 px-6 pb-8 max-w-7xl mx-auto">
        <div className="py-6">
          <h1 className="text-3xl font-black text-orange-500 tracking-widest uppercase">NETWORK SECURITY</h1>
          <p className="text-white/40 text-sm mt-1">Encrypted gateway monitoring and TLS status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <SiliconCard className="flex flex-col items-center justify-center py-8">
            <RiskMeter score={healthScore} size={140} label="NETWORK HEALTH" />
          </SiliconCard>
          <SiliconCard>
            <h3 className="text-white/50 text-xs tracking-widest uppercase mb-4">ACTIVE GATEWAYS</h3>
            <div className="space-y-3">
              {online.map(gw => <GatewayIndicator key={gw.id} gateway={gw} />)}
            </div>
          </SiliconCard>
          <SiliconCard>
            <h3 className="text-white/50 text-xs tracking-widest uppercase mb-4">SECURITY PROTOCOLS</h3>
            <div className="space-y-3">
              {gateways.map(gw => <SecurityBadge key={gw.id} protocol={gw.protocol} bits={gw.encryptionBits} />)}
            </div>
          </SiliconCard>
        </div>

        <EncryptionStatus gateways={gateways} />
      </main>
    </div>
  );
}
