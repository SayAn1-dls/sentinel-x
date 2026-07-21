'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, Activity, AlertTriangle, ShieldCheck, Bot, Eye, Radio,
  RefreshCw, Filter, ChevronDown, Zap, Globe, Database,
  TrendingUp, Clock, BarChart3, FileDown, Search
} from 'lucide-react';
import { Transaction, RiskLevel } from '@/lib/types';
import { generateTransaction, generateInitialTransactions } from '@/lib/mock-data';
import { generateForensicPDF } from '@/lib/pdf-generator';
import TransactionRow from './TransactionRow';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'synthetic' | 'human' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTransactions(generateInitialTransactions(30));
  }, []);

  useEffect(() => {
    if (!isLive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTransactions(prev => {
        const newTx = generateTransaction();
        const updated = [newTx, ...prev];
        return updated.slice(0, 100);
      });
    }, 3000 + Math.random() * 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive]);

  const filtered = transactions.filter(tx => {
    if (filter === 'synthetic' && tx.entityType !== 'Synthetic AI') return false;
    if (filter === 'human' && tx.entityType !== 'Human') return false;
    if (filter === 'flagged' && !['FLAGGED', 'BLOCKED'].includes(tx.status)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return tx.id.toLowerCase().includes(q) ||
        tx.sender.toLowerCase().includes(q) ||
        tx.receiver.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: transactions.length,
    synthetic: transactions.filter(t => t.entityType === 'Synthetic AI').length,
    flagged: transactions.filter(t => ['FLAGGED', 'BLOCKED'].includes(t.status)).length,
    verified: transactions.filter(t => t.status === 'VERIFIED').length,
    blocked: transactions.filter(t => t.status === 'BLOCKED').length,
    totalVolume: transactions.reduce((s, t) => s + t.amount, 0),
    avgConfidence: transactions.length ? transactions.reduce((s, t) => s + t.confidence, 0) / transactions.length : 0,
  };

  const syntheticRate = stats.total ? ((stats.synthetic / stats.total) * 100).toFixed(1) : '0';
  const threatRate = stats.total ? ((stats.flagged / stats.total) * 100).toFixed(1) : '0';

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${(v / 1e3).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen bg-obsidian noise-overlay">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-obsidian/95 backdrop-blur-xl border-b border-obsidian-border">
        <div className="h-[2px] vermilion-gradient" />
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-vermilion" strokeWidth={1.5} />
              <div>
                <h1 className="font-heading text-lg font-bold text-off-white tracking-tight leading-none">SENTINEL-X</h1>
                <p className="text-[9px] font-mono text-off-white-dim tracking-widest">KINEXYS FORENSIC INTELLIGENCE</p>
              </div>
            </div>
            <div className="h-6 w-px bg-obsidian-border mx-2" />
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald animate-pulse' : 'bg-off-white-dim'}`} />
              <span className="text-[10px] font-mono text-off-white-dim">{isLive ? 'LIVE FEED' : 'PAUSED'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-off-white-dim" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-obsidian-card border border-obsidian-border rounded-md pl-8 pr-3 py-1.5 text-xs text-off-white placeholder:text-off-white-dim/50 focus:outline-none focus:border-vermilion/50 w-56 font-mono"
              />
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                isLive
                  ? 'border-emerald/30 text-emerald bg-emerald-glow'
                  : 'border-obsidian-border text-off-white-dim hover:border-off-white-dim/30'
              }`}
            >
              <Radio className="w-3 h-3" />
              {isLive ? 'LIVE' : 'PAUSED'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6 relative z-10">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { label: 'TOTAL TXNS', value: stats.total.toString(), icon: Database, color: 'text-off-white' },
            { label: 'VOLUME', value: formatVolume(stats.totalVolume), icon: TrendingUp, color: 'text-off-white' },
            { label: 'SYNTHETIC AI', value: stats.synthetic.toString(), sub: `${syntheticRate}%`, icon: Bot, color: 'text-vermilion' },
            { label: 'FLAGGED', value: stats.flagged.toString(), sub: `${threatRate}%`, icon: AlertTriangle, color: 'text-vermilion' },
            { label: 'BLOCKED', value: stats.blocked.toString(), icon: Shield, color: 'text-vermilion' },
            { label: 'VERIFIED', value: stats.verified.toString(), icon: ShieldCheck, color: 'text-emerald' },
            { label: 'AVG CONFIDENCE', value: `${stats.avgConfidence.toFixed(1)}%`, icon: BarChart3, color: 'text-off-white' },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-obsidian-card border border-obsidian-border rounded-lg p-3 hover:border-obsidian-hover transition-colors">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-[8px] font-mono text-off-white-dim tracking-wider">{label}</span>
              </div>
              <p className={`text-xl font-heading font-bold ${color}`}>{value}</p>
              {sub && <p className="text-[10px] font-mono text-off-white-dim mt-0.5">{sub} of total</p>}
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {(
              [
                { key: 'all', label: 'All Transactions', count: transactions.length },
                { key: 'synthetic', label: 'Synthetic AI', count: stats.synthetic },
                { key: 'flagged', label: 'Flagged / Blocked', count: stats.flagged },
                { key: 'human', label: 'Human Verified', count: stats.verified },
              ] as const
            ).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                  filter === key
                    ? 'border-vermilion/40 text-vermilion bg-vermilion-glow'
                    : 'border-obsidian-border text-off-white-dim hover:border-off-white-dim/30 hover:text-off-white'
                }`}
              >
                {label} <span className="ml-1 opacity-60">({count})</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-off-white-dim">
            <Zap className="w-3 h-3 text-amber" />
            <span>Processing {(Math.random() * 2000 + 500).toFixed(0)} txns/sec</span>
          </div>
        </div>

        {/* Transaction Feed */}
        <div className="bg-obsidian-card border border-obsidian-border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2.5fr_2fr_1.2fr_1.2fr_1fr_1fr_0.5fr] gap-3 items-center px-4 py-2.5 bg-obsidian-light border-b border-obsidian-border text-[9px] font-mono tracking-wider text-off-white-dim">
            <span>TRANSACTION ID</span>
            <span>COUNTERPARTIES</span>
            <span className="text-right">AMOUNT</span>
            <span>ENTITY</span>
            <span>RISK</span>
            <span>STATUS</span>
            <span />
          </div>

          {/* Rows */}
          <div ref={feedRef} className="max-h-[calc(100vh-380px)] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Eye className="w-8 h-8 text-off-white-dim/30 mb-3" />
                <p className="text-sm text-off-white-dim">No transactions match your criteria</p>
              </div>
            ) : (
              filtered.map((tx, i) => (
                <TransactionRow key={tx.id} tx={tx} index={i} />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-[9px] font-mono text-off-white-dim/50">
          <span>SENTINEL-X™ v4.2.1 · Kinexys Forensic Intelligence Platform</span>
          <span>Showing {filtered.length} of {transactions.length} transactions · {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
