import { IPGeolocation, ForensicIntelligence, DeviceFingerprint } from './forensic-types';
import { 
  detectTemporalAnomaly, 
  detectCrossChainLinks, 
  calculateFingerprintEntropy,
  analyzeBehavioralBiometrics,
  analyzeTransactionVelocity
} from './forensic-engine';

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
  },
  {
    ip: '45.128.190.1',
    country: 'NL',
    city: 'Amsterdam',
    latitude: 52.3676,
    longitude: 4.9041,
    isp: 'M247 Ltd',
    proxy: false,
    vpn: true,
    tor: false
  }
];

export function enrichWithForensics(transaction: any): any {
  const timestamp = transaction.timestamp || new Date().toISOString();
  const temporalAnomaly = detectTemporalAnomaly(timestamp);
  const geolocation = MOCK_IP_GEOLOCATIONS[Math.floor(Math.random() * MOCK_IP_GEOLOCATIONS.length)];
  
  const mockFingerprint: DeviceFingerprint = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    language: 'en-US',
    colorDepth: 24,
    hardwareConcurrency: 8,
    deviceMemory: 16,
    canvasHash: 'cf83e1357eefb8bd',
    webGLRenderer: 'Apple M1'
  };

  const fingerprintEntropy = calculateFingerprintEntropy(mockFingerprint);
  
  const behavioralBiometrics = analyzeBehavioralBiometrics([
    { type: 'mousemove', timestamp: Date.now() - 500 },
    { type: 'mousemove', timestamp: Date.now() - 400 },
    { type: 'keydown', timestamp: Date.now() - 300 }
  ]);

  const behavioralBiometricSignature = 'SIG-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  const velocityMetrics = analyzeTransactionVelocity([
    { amount: transaction.amount || 1000, timestamp: Date.now() },
    { amount: 500, timestamp: Date.now() - 10000 },
    { amount: 2000, timestamp: Date.now() - 20000 }
  ]);

  const crossChainLinks = detectCrossChainLinks(
    transaction.address || '0xUNKNOWN',
    geolocation.ip,
    behavioralBiometricSignature
  );
  
  return {
    ...transaction,
    forensics: {
      geolocation,
      velocityMetrics,
      temporalAnomaly,
      fingerprintEntropy,
      behavioralBiometricSignature,
      behavioralBiometrics,
      deviceFingerprint: mockFingerprint,
      crossChainLinks
    }
  };
}