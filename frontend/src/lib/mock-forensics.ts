import { IPGeolocation, DeviceFingerprint, KernelForensics } from './forensic-types';
import { 
  detectTemporalAnomaly, 
  detectCrossChainLinks, 
  calculateFingerprintEntropy,
  analyzeBehavioralBiometrics, 
  analyzeTransactionVelocity,
  detectSessionReplay,
  analyzeASNReputation,
  analyzeKernelForensics,
  analyzePeerProximity,
  analyzeSecureEnclave,
  analyzeBrowserIntegrity,
  analyzeAIAgentBehavior,
  analyzeSmartContractRisk,
  analyzeDarkWebExposure,
  analyzeNetworkPackets,
  analyzeCloudInfrastructure,
  analyzeDNSIntegrity, 
  analyzeSteganography,
  analyzeHIDForensics,
  analyzeZKPForensics,
  analyzeOpticalAirGap,
  analyzeSupplyChainIntegrity,
  analyzeSideChannelSignals,
  analyzeMemoryForensics,
  analyzeBehavioralBiometricsAdvanced,
  analyzeFingerprintForensics,
  analyzeBGPIntegrity,
  analyzeQuantumForensics
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
  },
  {
    ip: '13.233.191.2',
    country: 'IN',
    city: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    isp: 'Amazon.com',
    proxy: false,
    vpn: false,
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

  const sessionReplay = detectSessionReplay([
    { type: 'mousemove', timestamp: Date.now() - 1000 },
    { type: 'mousemove', timestamp: Date.now() - 950 },
    { type: 'mousemove', timestamp: Date.now() - 900 }
  ]);

  const asnReputation = analyzeASNReputation(geolocation.isp === 'Verizon' ? 701 : 4134);
  
  const kernelForensics: KernelForensics = {
    ...analyzeKernelForensics(),
    heapSprayDetected: Math.random() > 0.98,
    stackCanaryCorrupted: Math.random() > 0.99,
    aslrDisabled: Math.random() > 0.95,
    codeInjectionDetected: Math.random() > 0.995
  };

  const peerAnalysis = analyzePeerProximity(geolocation.ip);
  const secureEnclave = analyzeSecureEnclave();
  const browserIntegrity = analyzeBrowserIntegrity();
  
  const aiAgentDetection = analyzeAIAgentBehavior(
    transaction.memo || 'Standard treasury transfer execution.',
    450
  );

  const smartContractForensics = analyzeSmartContractRisk([
    { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', verified: true, isMixer: false, isDrainer: false },
    { address: '0x2222222222222222222222222222222222222222', verified: false, isMixer: true, isDrainer: false }
  ]);

  const darkWebExposure = analyzeDarkWebExposure(transaction.senderEmail || 'user@example.com');
  const networkPacketAnalysis = analyzeNetworkPackets();
  
  const cloudInfrastructure = analyzeCloudInfrastructure(geolocation.ip);
  const dnsIntegrity = analyzeDNSIntegrity('sentinel-x.io');
  const steganography = analyzeSteganography();
  const bgpRouting = analyzeBGPIntegrity(geolocation.ip);
  
  const hidForensics = {
    ...analyzeHIDForensics(),
    isKeystrokeInjectionDetected: Math.random() > 0.99,
    isRubberDuckySignaturePresent: Math.random() > 0.995,
    reportingRateAnomaly: Math.random() > 0.97
  };

  const zkpForensics = {
    ...analyzeZKPForensics(),
    isInvalidProof: Math.random() > 0.999,
    isSoundnessRiskDetected: Math.random() > 0.98
  };

  const opticalAirGapForensics = {
    ...analyzeOpticalAirGap(),
    qrRapidExfiltrationLikely: Math.random() > 0.997,
    highFrequencyFlickerDetected: Math.random() > 0.99
  };

  const memoryForensics = {
    ...analyzeMemoryForensics(),
    ramScrapingDetected: Math.random() > 0.998,
    dmaAttackVectorFound: Math.random() > 0.995,
    pagingIntegrityVerified: Math.random() > 0.01
  };
  
  const quantumForensics = {
    ...analyzeQuantumForensics(),
    isShorAlgorithmDetected: Math.random() > 0.999,
    latticeBasisReductionDetected: Math.random() > 0.995,
    isPostQuantumSecure: Math.random() > 0.1
  };

  const sideChannelForensics = {
    ...analyzeSideChannelSignals(),
    cpuPowerAnalysisDetected: Math.random() > 0.999,
    cacheTimingAttackLikely: Math.random() > 0.995,
    speculativeExecutionRisk: Math.random() * 0.4
  };

  const supplyChainForensics = {
    ...analyzeSupplyChainIntegrity(),
    tamperEvidenceDetected: Math.random() > 0.997,
    firmwareIntegrityVerified: Math.random() > 0.01
  };

  const biometricForensics = analyzeBehavioralBiometricsAdvanced(
    [120, 150, 110, 130],
    [{x: 10, y: 20}, {x: 15, y: 25}, {x: 30, y: 40}]
  );
  
  const fingerprintForensics = analyzeFingerprintForensics(mockFingerprint);

  return {
    ...transaction,
    forensics: {
      geolocation,
      asnReputation,
      velocityMetrics,
      temporalAnomaly,
      fingerprintEntropy,
      behavioralBiometricSignature,
      behavioralBiometrics,
      biometricForensics,
      deviceFingerprint: mockFingerprint,
      fingerprintForensics,
      crossChainLinks,
      sessionReplay,
      kernelForensics,
      peerAnalysis,
      secureEnclave,
      browserIntegrity,
      aiAgentDetection,
      smartContractForensics,
      darkWebExposure,
      networkPacketAnalysis,
      cloudInfrastructure,
      dnsIntegrity, 
      steganography,
      bgpRouting,
      hidForensics,
      zkpForensics,
      opticalAirGapForensics,
      supplyChainForensics,
      sideChannelForensics,
      memoryForensics
      quantumForensics,
    }
  };
}
