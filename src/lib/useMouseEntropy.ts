'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface MousePoint {
  x: number;
  y: number;
  t: number;
}

export interface EntropyState {
  entropy: number;          // 0-1 normalized
  signal: 'BIOLOGICAL' | 'SYNTHETIC' | 'CALIBRATING';
  rawEntropy: number;       // raw Shannon entropy value
  sampleCount: number;
  velocity: number;
  directionChanges: number;
}

const BUFFER_SIZE = 64;
const ANGLE_BINS = 16;
const MIN_SAMPLES = 12;
const ENTROPY_THRESHOLD = 0.42;
const IDLE_TIMEOUT_MS = 3000;

function shannonEntropy(bins: number[], total: number): number {
  if (total === 0) return 0;
  let h = 0;
  for (const count of bins) {
    if (count === 0) continue;
    const p = count / total;
    h -= p * Math.log2(p);
  }
  return h;
}

export function useMouseEntropy(): EntropyState {
  const bufferRef = useRef<MousePoint[]>([]);
  const [state, setState] = useState<EntropyState>({
    entropy: 0,
    signal: 'CALIBRATING',
    rawEntropy: 0,
    sampleCount: 0,
    velocity: 0,
    directionChanges: 0,
  });
  const lastUpdateRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeEntropy = useCallback(() => {
    const buf = bufferRef.current;
    if (buf.length < MIN_SAMPLES) {
      setState(prev => ({ ...prev, signal: 'CALIBRATING', sampleCount: buf.length }));
      return;
    }

    // Compute angles between consecutive segments
    const angleBins = new Array(ANGLE_BINS).fill(0);
    const speeds: number[] = [];
    let dirChanges = 0;
    let prevAngle: number | null = null;

    for (let i = 1; i < buf.length; i++) {
      const dx = buf[i].x - buf[i - 1].x;
      const dy = buf[i].y - buf[i - 1].y;
      const dt = buf[i].t - buf[i - 1].t;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.5) continue; // skip noise

      const angle = Math.atan2(dy, dx); // -PI to PI
      const normalizedAngle = (angle + Math.PI) / (2 * Math.PI); // 0-1
      const bin = Math.min(ANGLE_BINS - 1, Math.floor(normalizedAngle * ANGLE_BINS));
      angleBins[bin]++;

      if (dt > 0) {
        speeds.push(dist / dt);
      }

      if (prevAngle !== null) {
        let angleDiff = Math.abs(angle - prevAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        if (angleDiff > Math.PI / 6) dirChanges++;
      }
      prevAngle = angle;
    }

    const totalAngleSamples = angleBins.reduce((a, b) => a + b, 0);
    const angleEntropy = shannonEntropy(angleBins, totalAngleSamples);
    const maxEntropy = Math.log2(ANGLE_BINS); // 4.0 for 16 bins

    // Speed variance component
    let speedVariance = 0;
    if (speeds.length > 1) {
      const meanSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      speedVariance = speeds.reduce((a, s) => a + (s - meanSpeed) ** 2, 0) / speeds.length;
      speedVariance = Math.min(1, Math.sqrt(speedVariance) / (meanSpeed + 0.001));
    }

    // Combined entropy: 70% angle diversity + 30% speed variance
    const combinedRaw = angleEntropy / maxEntropy;
    const normalizedEntropy = Math.min(1, combinedRaw * 0.7 + speedVariance * 0.3);

    const avgVelocity = speeds.length > 0
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : 0;

    const signal: EntropyState['signal'] = normalizedEntropy >= ENTROPY_THRESHOLD
      ? 'BIOLOGICAL'
      : 'SYNTHETIC';

    setState({
      entropy: normalizedEntropy,
      signal,
      rawEntropy: angleEntropy,
      sampleCount: buf.length,
      velocity: avgVelocity,
      directionChanges: dirChanges,
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const buf = bufferRef.current;
      buf.push({ x: e.clientX, y: e.clientY, t: now });
      if (buf.length > BUFFER_SIZE) buf.shift();

      // Throttle computation to every 100ms
      if (now - lastUpdateRef.current > 100) {
        lastUpdateRef.current = now;
        computeEntropy();
      }

      // Reset idle timer
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        // If idle too long, switch to synthetic (no movement = suspicious)
        setState(prev => ({
          ...prev,
          signal: prev.sampleCount >= MIN_SAMPLES ? 'SYNTHETIC' : 'CALIBRATING',
          entropy: Math.max(0, prev.entropy - 0.15),
        }));
      }, IDLE_TIMEOUT_MS);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [computeEntropy]);

  return state;
}
