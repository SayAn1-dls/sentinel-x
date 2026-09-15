'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Pulse, ChartLine, FingerprintSimple, Globe, GearSix,
  ClockCounterClockwise, CaretRight, CaretLeft, User, Users,
  Database, HardDrives, Cpu, ArrowsClockwise, Check, Trash, PencilSimple,
  Plus, Power, Warning, CheckCircle, X
} from '@phosphor-icons/react';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: Pulse, label: 'Dashboard' },
  { href: '/analysis', icon: ChartLine, label: 'AI Analysis' },
  { href: '/audit', icon: ClockCounterClockwise, label: 'Audit Log' },
  { href: '/network', icon: Globe, label: 'Network' },
  { href: '/security', icon: FingerprintSimple, label: 'Security' },
  { href: '/admin', icon: GearSix, label: 'Admin', active: true },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[#0C0C14] border-r border-white/[0.04] transition-all duration-300 z-40 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.04]">
        <ShieldCheck weight="duotone" className="w-7 h-7 text-[#00D4FF] flex-shrink-0" />
        {!collapsed && <span className="text-sm font-bold tracking-tight text-white">SENTINEL-X</span>}
        <button onClick={onToggle} className="ml-auto text-white/30 hover:text-white/60 transition-colors">
          {collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
        </button>
      </div>
      <nav className="mt-4 px-3 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${item.active ? 'bg-[#00D4FF]/10 text-[#00D4FF] font-medium' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'}`}>
            <item.icon weight={item.active ? 'duotone' : 'regular'} className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.04]">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#00FFB3]/20 flex items-center justify-center flex-shrink-0">
            <User weight="bold" className="w-4 h-4 text-[#00D4FF]" />
          </div>
          {!collapsed && <div className="flex-1 min-w-0"><div className="text-xs font-medium text-white/70 truncate">Operator</div><div className="text-[10px] text-white/30">sentinel-x</div></div>}
        </div>
      </div>
    </aside>
  );
}

const MOCK_USERS = [
  { id: 1, name: 'Sayan Bhattacharya', email: 'sayan@sentinel-x.io', role: 'Super Admin', status: 'active', lastSeen: 'Now' },
  { id: 2, name: 'Alex Chen', email: 'alex.chen@sentinel-x.io', role: 'Analyst', status: 'active', lastSeen: '5 min ago' },
  { id: 3, name: 'Maria Garcia', email: 'maria.g@sentinel-x.io', role: 'Compliance Officer', status: 'active', lastSeen: '1 hour ago' },
  { id: 4, name: 'Raj Patel', email: 'raj.p@sentinel-x.io', role: 'Network Admin', status: 'inactive', lastSeen: '3 days ago' },
  { id: 5, name: 'Emma Wilson', email: 'emma.w@sentinel-x.io', role: 'Analyst', status: 'active', lastSeen: '20 min ago' },
];

const MOCK_SERVICES = [
  { name: 'AI Analysis Engine', status: 'running', cpu: '34%', memory: '2.1 GB', uptime: '14d 6h', version: 'v3.2.1' },
  { name: 'Transaction Monitor', status: 'running', cpu: '67%', memory: '4.8 GB', uptime: '14d 6h', version: 'v2.8.0' },
  { name: 'Sanctions Screener', status: 'running', cpu: '12%', memory: '1.4 GB', uptime: '14d 6h', version: 'v1.5.3' },
  { name: 'Network Scanner', status: 'running', cpu: '8%', memory: '890 MB', uptime: '14d 6h', version: 'v2.1.0' },
  { name: 'Batch Processor', status: 'idle', cpu: '1%', memory: '340 MB', uptime: '14d 6h', version: 'v1.2.4' },
  { name: 'Report Generator', status: 'idle', cpu: '0%', memory: '210 MB', uptime: '14d 6h', version: 'v1.0.8' },
];

const MOCK_SYSTEM_INFO = [
  { label: 'Platform Version', value: 'SENTINEL-X v4.2.0' },
  { label: 'Database', value: 'PostgreSQL 16.1 — 847 GB' },
  { label: 'Cache Layer', value: 'Redis 7.2 — 12 GB / 32 GB' },
  { label: 'API Uptime', value: '99.997% (90d)' },
  { label: 'SSL Certificate', value: 'Valid — Expires 2026-03-15' },
  { label: 'Last Backup', value: '22 min ago — Full Snapshot' },
];

const ROLE_COLORS: Record<string, string> = {
  'Super Admin': '#FF6B00', 'Analyst': '#00D4FF', 'Compliance Officer': '#00FFB3', 'Network Admin': '#FFB800',
};

export default function AdminPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [users, setUsers] = useState(MOCK_USERS);
  const [services, setServices] = useState(MOCK_SERVICES);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Analyst' });
  const [restartingService, setRestartingService] = useState<string | null>(null);

  const toggleUserStatus = useCallback((id: number) => {
    try {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    } catch (_) {}
  }, []);

  const removeUser = useCallback((id: number) => {
    try {
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (_) {}
  }, []);

  const addUser = useCallback(() => {
    try {
      if (!newUser.name || !newUser.email) return;
      setUsers(prev => [...prev, {
        id: Date.now(), name: newUser.name, email: newUser.email,
        role: newUser.role, status: 'active', lastSeen: 'Just added'
      }]);
      setNewUser({ name: '', email: '', role: 'Analyst' });
      setShowAddUser(false);
    } catch (_) {}
  }, [newUser]);

  const restartService = useCallback((name: string) => {
    try {
      setRestartingService(name);
      setTimeout(() => setRestartingService(null), 2000);
    } catch (_) { setRestartingService(null); }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[68px]' : 'ml-[240px]'}`}>
        <header className="sticky top-0 z-30 bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/[0.04] px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><GearSix weight="duotone" className="w-5 h-5 text-white/50" /> Administration</h1>
            <p className="text-xs text-white/30">User management, services & system configuration</p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* System Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MOCK_SYSTEM_INFO.map((info) => (
              <div key={info.label} className="p-3 rounded-xl border border-white/[0.06] bg-[#0D0D14]">
                <div className="text-[10px] text-white/20 mb-1">{info.label}</div>
                <div className="text-xs font-medium text-white/60">{info.value}</div>
              </div>
            ))}
          </div>

          {/* User Management */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D0D14] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Users weight="duotone" className="w-4 h-4 text-[#00D4FF]" /> User Management</h2>
              <button onClick={() => setShowAddUser(true)}
                className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors">
                <Plus size={12} weight="bold" /> Add User
              </button>
            </div>

            <AnimatePresence>
              {showAddUser && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/[0.04] overflow-hidden">
                  <div className="p-4 flex flex-wrap items-end gap-3 bg-[#00D4FF]/[0.02]">
                    <div>
                      <label className="text-[10px] text-white/20 block mb-1">Name</label>
                      <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                        className="px-3 py-1.5 rounded-lg bg-[#0A0F1E] border border-white/[0.06] text-xs text-white focus:border-[#00D4FF]/30 focus:outline-none w-40" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/20 block mb-1">Email</label>
                      <input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                        className="px-3 py-1.5 rounded-lg bg-[#0A0F1E] border border-white/[0.06] text-xs text-white focus:border-[#00D4FF]/30 focus:outline-none w-48" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/20 block mb-1">Role</label>
                      <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                        className="px-3 py-1.5 rounded-lg bg-[#0A0F1E] border border-white/[0.06] text-xs text-white focus:border-[#00D4FF]/30 focus:outline-none">
                        <option>Analyst</option><option>Compliance Officer</option><option>Network Admin</option><option>Super Admin</option>
                      </select>
                    </div>
                    <button onClick={addUser} className="px-4 py-1.5 rounded-lg bg-[#00D4FF] text-black text-xs font-medium hover:bg-[#00D4FF]/90 transition-colors">
                      <Check size={14} weight="bold" />
                    </button>
                    <button onClick={() => setShowAddUser(false)} className="px-4 py-1.5 rounded-lg bg-white/5 text-white/30 text-xs hover:bg-white/10 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="divide-y divide-white/[0.03]">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${ROLE_COLORS[user.role] || '#00D4FF'}15`, color: ROLE_COLORS[user.role] || '#00D4FF' }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white/70">{user.name}</div>
                    <div className="text-[10px] text-white/20">{user.email}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ color: ROLE_COLORS[user.role] || '#00D4FF', backgroundColor: `${ROLE_COLORS[user.role] || '#00D4FF'}15` }}>
                    {user.role}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${user.status === 'active' ? 'text-[#00FFB3] bg-[#00FFB3]/10' : 'text-white/20 bg-white/5'}`}>
                    {user.status}
                  </span>
                  <span className="text-[10px] text-white/20 w-20">{user.lastSeen}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleUserStatus(user.id)} title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      className="p-1.5 rounded hover:bg-white/5 text-white/20 hover:text-white/40 transition-colors">
                      <Power size={14} />
                    </button>
                    {user.id !== 1 && (
                      <button onClick={() => removeUser(user.id)} title="Remove user"
                        className="p-1.5 rounded hover:bg-[#FF2D55]/10 text-white/20 hover:text-[#FF2D55] transition-colors">
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Status */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D0D14] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04]">
              <h2 className="text-sm font-semibold flex items-center gap-2"><HardDrives weight="duotone" className="w-4 h-4 text-[#00FFB3]" /> Service Status</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.03]">
              {services.map((svc) => (
                <div key={svc.name} className="p-4 bg-[#0D0D14] hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${svc.status === 'running' ? 'bg-[#00FFB3]' : 'bg-[#FFB800]'}`} />
                      <span className="text-xs font-medium text-white/70">{svc.name}</span>
                      <span className="text-[10px] text-white/15 font-mono">{svc.version}</span>
                    </div>
                    <button onClick={() => restartService(svc.name)}
                      className="p-1.5 rounded hover:bg-white/5 text-white/20 hover:text-white/40 transition-colors"
                      disabled={restartingService === svc.name}>
                      <ArrowsClockwise size={14} className={restartingService === svc.name ? 'animate-spin text-[#00D4FF]' : ''} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><div className="text-xs font-medium text-white/50">{svc.cpu}</div><div className="text-[10px] text-white/15">CPU</div></div>
                    <div><div className="text-xs font-medium text-white/50">{svc.memory}</div><div className="text-[10px] text-white/15">Memory</div></div>
                    <div><div className="text-xs font-medium text-white/50">{svc.uptime}</div><div className="text-[10px] text-white/15">Uptime</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
