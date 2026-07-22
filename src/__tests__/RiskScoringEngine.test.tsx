import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock canvas getContext
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
  scale: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  setTransform: jest.fn(),
  createConicGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
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

jest.useFakeTimers();

import RiskScoringEngine from '@/components/RiskScoringEngine';

describe('RiskScoringEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component title', () => {
    render(<RiskScoringEngine />);
    expect(screen.getByText('RISK SCORING ENGINE')).toBeInTheDocument();
  });

  it('renders the footer text', () => {
    render(<RiskScoringEngine />);
    expect(screen.getByText(/RSE v2.1/)).toBeInTheDocument();
  });

  it('shows a risk level badge', () => {
    render(<RiskScoringEngine />);
    const badges = screen.getAllByText(/CRITICAL|ELEVATED|MODERATE|NOMINAL/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('shows active threat signals section', () => {
    render(<RiskScoringEngine />);
    expect(screen.getByText('ACTIVE THREAT SIGNALS')).toBeInTheDocument();
  });

  it('shows trend indicator', () => {
    render(<RiskScoringEngine />);
    const trend = screen.getByText(/ESCALATING|STABILIZING|STEADY/);
    expect(trend).toBeInTheDocument();
  });

  it('updates signals after interval', () => {
    render(<RiskScoringEngine />);
    act(() => { jest.advanceTimersByTime(4100); });
    // Should still render without errors
    expect(screen.getByText('RISK SCORING ENGINE')).toBeInTheDocument();
  });

  it('shows signal count ratio', () => {
    render(<RiskScoringEngine />);
    // Should show X/10 format
    const ratio = screen.getByText(/\/10$/);
    expect(ratio).toBeInTheDocument();
  });
});
