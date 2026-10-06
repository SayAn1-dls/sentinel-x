import { NetworkGateway, NetworkProtocol } from './types';
import { generateId } from './utils';
import { MOCK_GATEWAYS } from './mock-data';

export class NetworkSecurityMonitor {
  private gateways: NetworkGateway[] = MOCK_GATEWAYS;

  getAll(): NetworkGateway[] { return this.gateways; }

  getOnline(): NetworkGateway[] {
    return this.gateways.filter(g => g.status === 'ONLINE');
  }

  getHealthScore(): number {
    const online = this.gateways.filter(g => g.status === 'ONLINE').length;
    return Math.round((online / this.gateways.length) * 100);
  }

  getAverageLatency(): number {
    const online = this.getOnline();
    if (!online.length) return 0;
    return Math.round(online.reduce((sum, g) => sum + g.latency, 0) / online.length);
  }

  checkEncryption(gatewayId: string): { secure: boolean; protocol: NetworkProtocol; bits: number } {
    const gw = this.gateways.find(g => g.id === gatewayId);
    if (!gw) return { secure: false, protocol: 'PLAIN', bits: 0 };
    return {
      secure: gw.protocol !== 'PLAIN',
      protocol: gw.protocol,
      bits: gw.encryptionBits,
    };
  }

  simulateHeartbeat(): void {
    this.gateways = this.gateways.map(gw => ({
      ...gw,
      latency: gw.latency + Math.floor((Math.random() - 0.5) * 10),
      lastChecked: Date.now(),
    }));
  }

  addGateway(name: string, protocol: NetworkProtocol, encryptionBits: number): NetworkGateway {
    const gw: NetworkGateway = {
      id: `GW-${generateId()}`,
      name,
      protocol,
      status: 'ONLINE',
      latency: Math.floor(Math.random() * 50) + 5,
      encryptionBits,
      lastChecked: Date.now(),
    };
    this.gateways.push(gw);
    return gw;
  }

  getProtocolDistribution(): Record<NetworkProtocol, number> {
    return this.gateways.reduce((acc, gw) => {
      acc[gw.protocol] = (acc[gw.protocol] || 0) + 1;
      return acc;
    }, {} as Record<NetworkProtocol, number>);
  }
}

export const networkMonitor = new NetworkSecurityMonitor();
