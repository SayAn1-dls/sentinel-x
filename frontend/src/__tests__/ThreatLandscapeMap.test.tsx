import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock canvas
const mockCtx = {
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  fillText: jest.fn(),
  fillRect: jest.fn(),
  closePath: jest.fn(),
  scale: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  setTransform: jest.fn(),
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  set strokeStyle(_: any) {},
  set fillStyle(_: any) {},
  set lineWidth(_: any) {},
  set lineCap(_: any) {},
  set shadowColor(_: any) {},
  set shadowBlur(_: any) {},
  set textAlign(_: any) {},
  set textBaseline(_: any) {},
  set font(_: any) {},
  set globalAlpha(_: any) {},
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx as any);

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

jest.useFakeTimers();

import ThreatLandscapeMap from '@/components/ThreatLandscapeMap';

describe('ThreatLandscapeMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component title', () => {
    render(<ThreatLandscapeMap />);
    expect(screen.getByText('THREAT LANDSCAPE MAP')).toBeInTheDocument();
  });

  it('renders legend items', () => {
    render(<ThreatLandscapeMap />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('shows LIVE FEED indicator', () => {
    render(<ThreatLandscapeMap />);
    expect(screen.getByText('LIVE FEED')).toBeInTheDocument();
  });

  it('shows blocked count', () => {
    render(<ThreatLandscapeMap />);
    expect(screen.getByText(/BLOCKED/)).toBeInTheDocument();
  });

  it('shows active attack count', () => {
    render(<ThreatLandscapeMap />);
    expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<ThreatLandscapeMap />);
    expect(screen.getByText(/TLM v1.0/)).toBeInTheDocument();
  });

  it('updates attacks after interval', () => {
    render(<ThreatLandscapeMap />);
    act(() => { jest.advanceTimersByTime(5000); });
    expect(screen.getByText('THREAT LANDSCAPE MAP')).toBeInTheDocument();
  });
});
