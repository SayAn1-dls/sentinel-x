import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
  translate: jest.fn(),
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

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

jest.useFakeTimers();

import Dashboard from '@/components/Dashboard';

describe('Dashboard', () => {
  it('renders SENTINEL-X header', () => {
    render(<Dashboard />);
    expect(screen.getByText('SENTINEL-X')).toBeInTheDocument();
  });

  it('shows TRANSACTIONS view by default', () => {
    render(<Dashboard />);
    // Transaction feed table header should be visible on desktop
    expect(screen.getByText('TRANSACTION ID')).toBeInTheDocument();
  });

  it('has INTELLIGENCE view switcher button', () => {
    render(<Dashboard />);
    const intelButtons = screen.getAllByText('INTEL');
    expect(intelButtons.length).toBeGreaterThan(0);
  });

  it('switches to intelligence view and shows Risk Engine + Map', () => {
    render(<Dashboard />);
    const intelBtn = screen.getAllByText('INTEL')[0];
    fireEvent.click(intelBtn);
    expect(screen.getByText('RISK SCORING ENGINE')).toBeInTheDocument();
    expect(screen.getByText('THREAT LANDSCAPE MAP')).toBeInTheDocument();
  });

  it('switches back to transactions view', () => {
    render(<Dashboard />);
    // Go to intelligence
    fireEvent.click(screen.getAllByText('INTEL')[0]);
    expect(screen.getByText('RISK SCORING ENGINE')).toBeInTheDocument();
    // Go back to transactions
    fireEvent.click(screen.getAllByText('TXNS')[0]);
    expect(screen.getByText('TRANSACTION ID')).toBeInTheDocument();
  });
});
