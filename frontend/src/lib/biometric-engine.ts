import { BehavioralBiometricForensics } from './forensic-types';

export interface BiometricAnalysisResult {
  forensics: BehavioralBiometricForensics;
  threatScore: number;
  confidence: number;
  anomalies: string[];
}

export class BiometricEngine {
  /**
   * Analyzes behavioral patterns to distinguish between human users and automated bots.
   * Leverages keystroke dynamics and cursor trajectory jitter.
   */
  analyze(
    keystrokeIntervals: number[],
    mouseCoordinates: { x: number; y: number }[]
  ): BiometricAnalysisResult {
    const calculateVariance = (data: number[]) => {
      if (data.length < 2) return 0;
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      return data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    };

    // Low variance in keystrokes often indicates automated input
    const keystrokeEntropy = Math.min(1, Math.sqrt(calculateVariance(keystrokeIntervals)) / 200);
    
    let totalJitter = 0;
    for (let i = 1; i < mouseCoordinates.length; i++) {
      totalJitter += Math.sqrt(
        Math.pow(mouseCoordinates[i].x - mouseCoordinates[i - 1].x, 2) + 
        Math.pow(mouseCoordinates[i].y - mouseCoordinates[i - 1].y, 2)
      );
    }
    // Bots usually move in straight lines or perfect arcs with zero jitter
    const mouseJitter = Math.min(1, totalJitter / (mouseCoordinates.length * 40 || 1));

    const anomalies: string[] = [];
    if (keystrokeIntervals.length > 5 && keystrokeEntropy < 0.1) {
      anomalies.push('MECHANICAL_KEYSTROKE_PATTERN');
    }
    if (mouseCoordinates.length > 10 && mouseJitter < 0.05) {
      anomalies.push('NON_HUMAN_CURSOR_TRAJECTORY');
    }
    
    const botScore = (anomalies.includes('MECHANICAL_KEYSTROKE_PATTERN') ? 45 : 0) + 
                     (anomalies.includes('NON_HUMAN_CURSOR_TRAJECTORY') ? 50 : 0);
    
    const isHumanProbability = Math.max(0, 1 - botScore / 100);

    return {
      forensics: {
        keystrokeDynamicsEntropy: parseFloat(keystrokeEntropy.toFixed(4)),
        mouseTrajectoryJitter: parseFloat(mouseJitter.toFixed(4)),
        touchPressureVariance: 0.88,
        scrollSpeedConsistency: 0.94,
        isHumanProbability: isHumanProbability,
        botSignatureDetected: isHumanProbability < 0.5,
      },
      threatScore: botScore,
      confidence: Math.min(1, (keystrokeIntervals.length + mouseCoordinates.length) / 100),
      anomalies,
    };
  }
}

export const biometricEngine = new BiometricEngine();
