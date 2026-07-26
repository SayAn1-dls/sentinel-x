import { IPGeolocation, ForensicIntelligence, TemporalAnomalySignal } from './forensic-types';
import { detectTemporalAnomaly } from './forensic-engine';

export const MOCK_IP_GEOLOCATIONS: IPGeolocation[] = [
  {
    ip: '192.168.1.1',
    country: 'US',
    city: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    isp: 'Verizon',
    proxy: false,
    vpn: false,
    tor: false
  },
  {
    ip: '103.21.244.0',
    country: 'SG',
    city: 'Singapore',
    latitude: 1.3521,
    longitude: 103.8198,
    isp: 'Telin',
    proxy: true,
    vpn: false,
    tor: false
  }
];

export function enrichWithForensics(transaction: any): any {
  const temporalAnomaly = detectTemporalAnomaly(transaction.timestamp || new Date().toISOString());
  
  return {
    ...transaction,
    forensics: {
      geolocation: MOCK_IP_GEOLOCATIONS[Math.floor(Math.random() * MOCK_IP_GEOLOCATIONS.length)],
      velocityMetrics: {
        windowMinutes: 60,
        transactionCount: 5,
        totalAmount: 50000,
        averageAmount: 10000,
        velocityZScore: 1.2
      },
      temporalAnomaly,
      fingerprintEntropy: 15.4,
      behavioralBiometricSignature: 'SIG-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    }
  };
}
