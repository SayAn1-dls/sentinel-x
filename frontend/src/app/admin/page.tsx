'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Gear,
  User,
  Users,
  UserPlus,
  UserMinus,
  UserGear,
  Lock,
  Globe,
  Cpu,
  List,
  House,
  CaretRight,
  CaretLeft,
  Clock,
  Pencil,
  Trash,
  CheckCircle,
  WarningCircle,
  Eye,
  Key,
  ToggleLeft,
  ToggleRight,
  Lightning,
  Database,
  Download,
  Power,
  X,
  Plus,
  ShieldCheck,
  Warning,
  Fire,
} from '@phosphor-icons/react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/analysis', label: 'AI Analysis', icon: Cpu },
  { href: '/audit', label: 'Audit Log', icon: List },
  { href: '/network', label: 'Network', icon: Globe },
  { href: '/security', label: 'Security', icon: Lock },
  { href: '/admin', label: 'Admin', icon: Gear },
];

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  lastLogin: string;
  mfa: boolean;
  created: string;
}

interface RoleDef {
  id: string;
  name: string;
  color: string;
  permissions: string[];
  userCount: number;
}

interface FeatureToggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

interface ActivityEntry {
  id: number;
  time: string;
  actor: string;
  action: string;
  target: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#FF2D55',
  HIGH: '#FF6B00',
  MEDIUM: '#FFB800',
  LOW: '#00FFB3',
  INFO: '#00D4FF',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#00FFB3',
  SUSPENDED: '#FF2D55',
  PENDING: '#FFB800',
};

const INITIAL_USERS: UserRecord[] = [
  { id: 'USR-001', name: 'Sayan Bhattacharya', email: 'sayan@sentinel-x.io', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '09:12:34', mfa: true, created: '2025-01-15' },
  { id: 'USR-002', name: 'Priya Sharma', email: 'priya@sentinel-x.io', role: 'ADMIN', status: 'ACTIVE', lastLogin: '09:10:58', mfa: true, created: '2025-02-20' },
  { id: 'USR-003', name: 'Raj Patel', email: 'raj@sentinel-x.io', role: 'VIEWER', status: 'ACTIVE', lastLogin: '08:55:12', mfa: false, created: '2025-03-10' },
  { id: 'USR-004', name: 'Anita Desai', email: 'anita@sentinel-x.io', role: 'ANALYST', status: 'SUSPENDED', lastLogin: '07:30:45', mfa: true, created: '2025-04-05' },
  { id: 'USR-005', name: 'Vikram Singh', email: 'vikram@sentinel-x.io', role: 'OPERATOR', status: 'ACTIVE', lastLogin: '09:11:02', mfa: true, created: '2025-05-18' },
  { id: 'USR-006', name: 'Meera Joshi', email: 'meera@sentinel-x.io', role: 'ANALYST', status: 'ACTIVE', lastLogin: '09:08:44', mfa: true, created: '2025-06-22' },
  { id: 'USR-007', name: 'Arjun Nair', email: 'arjun@sentinel-x.io', role: 'VIEWER', status: 'PENDING', lastLogin: '—', mfa: false, created: '2026-09-14' },
  { id: 'USR-008', name: 'Deepa Kumar', email: 'deepa@sentinel-x.io', role: 'ADMIN', status: 'ACTIVE', lastLogin: '09:12:11', mfa: true, created: '2025-07-30' },
  { id: 'USR-009', name: 'Karthik Rao', email: 'karthik@sentinel-x.io', role: 'OPERATOR', status: 'ACTIVE', lastLogin: '08:45:33', mfa: true, created: '2025-08-12' },
  { id: 'USR-010', name: 'Sneha Reddy', email: 'sneha@sentinel-x.io', role: 'ANALYST', status: 'ACTIVE', lastLogin: '09:05:18', mfa: false, created: '2025-09-25' },
];

const INITIAL_ROLES: RoleDef[] = [
  { id: 'r1', name: 'SUPER_ADMIN', color: '#FF2D55', permissions: ['all.read', 'all.write', 'all.delete', 'users.manage', 'roles.manage', 'system.config', 'audit.export'], userCount: 1 },
  { id: 'r2', name: 'ADMIN', color: '#FF6B00', permissions: ['all.read', 'all.write', 'users.manage', 'audit.export'], userCount: 2 },
  { id: 'r3', name: 'ANALYST', color: '#00D4FF', permissions: ['transactions.read', 'analysis.read', 'analysis.write', 'network.read', 'audit.read'], userCount: 3 },
  { id: 'r4', name: 'OPERATOR', color: '#00FFB3', permissions: ['transactions.read', 'network.read', 'network.write', 'security.read'], userCount: 2 },
  { id: 'r5', name: 'VIEWER', color: '#FFB800', permissions: ['transactions.read', 'analysis.read', 'audit.read'], userCount: 2 },
];

const INITIAL_TOGGLES: FeatureToggle[] = [
  { id: 't1', name: 'Real-Time Transaction Monitoring', description: 'Live feed of all financial transactions with risk scoring', enabled: true, category: 'CORE' },
  { id: 't2', name: 'AI Anomaly Detection', description: 'ML-powered detection of suspicious transaction patterns', enabled: true, category: 'AI' },
  { id: 't3', name: 'Auto-Block High Risk', description: 'Automatically block transactions flagged as CRITICAL risk', enabled: false, category: 'ENFORCEMENT' },
  { id: 't4', name: 'Network Topology Map', description: 'Visual graph of entity relationships and transaction flows', enabled: true, category: 'VISUALIZATION' },
  { id: 't5', name: 'SMS Alert Notifications', description: 'Send SMS alerts for CRITICAL and HIGH severity events', enabled: true, category: 'NOTIFICATIONS' },
  { id: 't6', name: 'Email Digest Reports', description: 'Daily email summary of flagged transactions and threats', enabled: false, category: 'NOTIFICATIONS' },
  { id: 't7', name: 'API Rate Limiting', description: 'Enforce rate limits on all external API endpoints', enabled: true, category: 'SECURITY' },
  { id: 't8', name: 'Two-Factor Authentication', description: 'Require MFA for all user logins', enabled: true, category: 'SECURITY' },
  { id: 't9', name: 'Dark Web Monitoring', description: 'Scan dark web forums for leaked credentials and data', enabled: false, category: 'AI' },
  { id: 't10', name: 'Automated Compliance Reports', description: 'Generate compliance reports on scheduled intervals', enabled: true, category: 'COMPLIANCE' },
];

const INITIAL_ACTIVITY: ActivityEntry[] = [
  { id: 1, time: '09:12:34', actor: 'sayan.bhattacharya', action: 'Modified firewall rule FW-2291', target: 'Firewall Config', severity: 'HIGH' },
  { id: 2, time: '09:10:11', actor: 'priya.sharma', action: 'Suspended user anita.desai', target: 'User Management', severity: 'MEDIUM' },
  { id: 3, time: '09:08:22', actor: 'system', action: 'Auto-rotated API keys for svc-analytics', target: 'Key Management', severity: 'INFO' },
  { id: 4, time: '09:05:45', actor: 'deepa.kumar', action: 'Enabled "Auto-Block High Risk" toggle', target: 'Feature Toggles', severity: 'CRITICAL' },
  { id: 5, time: '09:03:18', actor: 'sayan.bhattacharya', action: 'Exported audit log (2026-09-01 to 2026-09-15)', target: 'Audit Log', severity: 'LOW' },
  { id: 6, time: '09:00:55', actor: 'vikram.singh', action: 'Isolated node ENT-0091 from network', target: 'Network Control', severity: 'HIGH' },
  { id: 7, time: '08:58:30', actor: 'system', action: 'Completed scheduled database backup', target: 'System', severity: 'INFO' },
  { id: 8, time: '08:55:12', actor: 'priya.sharma', action: 'Created new user arjun.nair (VIEWER)', target: 'User Management', severity: 'MEDIUM' },
  { id: 9, time: '08:52:44', actor: 'meera.joshi', action: 'Submitted analysis report AR-2026-0915', target: 'Analysis', severity: 'LOW' },
  { id: 10, time: '08:48:33', actor: 'system', action: 'IDS ruleset auto-updated to v2026.09.15', target: 'Security', severity: 'INFO' },
  { id: 11, time: '08:44:15', actor: 'deepa.kumar', action: 'Modified ANALYST role permissions', target: 'Role Management', severity: 'HIGH' },
  { id: 12, time: '08:40:02', actor: 'sayan.bhattacharya', action: 'Cleared 47 resolved alerts from queue', target: 'Alert Management', severity: 'LOW' },
  { id: 13, time: '08:36:28', actor: 'system', action: 'SSL certificate renewed for *.sentinel-x.io', target: 'Certificate Mgmt', severity: 'INFO' },
  { id: 14, time: '08:32:11', actor: 'karthik.rao', action: 'Flagged entity SHELL-77A for review', target: 'Network Control', severity: 'MEDIUM' },
  { id: 15, time: '08:28:45', actor: 'priya.sharma', action: 'Reset password for raj.patel', target: 'User Management', severity: 'MEDIUM' },
  { id: 16, time: '08:24:33', actor: 'system', action: 'Threat intelligence feed synced (142 new IOCs)', target: 'Threat Intel', severity: 'INFO' },
  { id: 17, time: '08:20:18', actor: 'sneha.reddy', action: 'Tagged 3 transactions as false positives', target: 'Analysis', severity: 'LOW' },
  { id: 18, time: '08:16:55', actor: 'vikram.singh', action: 'Initiated network topology scan', target: 'Network Control', severity: 'LOW' },
  { id: 19, time: '08:12:30', actor: 'deepa.kumar', action: 'Disabled "SMS Alert Notifications" temporarily', target: 'Feature Toggles', severity: 'MEDIUM' },
  { id: 20, time: '08:08:14', actor: 'system', action: 'Automated compliance check completed', target: 'Compliance', severity: 'INFO' },
];

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clock, setClock] = useState('');
  const [users, setUsers] = useState(INITIAL_USERS);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'toggles' | 'activity'>('users');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [activityPage, setActivityPage] = useState(0);
  const [toggleCategory, setToggleCategory] = useState<string>('ALL');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('VIEWER');

  const ACTIVITY_PER_PAGE = 10;

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const toggleUserStatus = (uid: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === uid
          ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' as const : u.status === 'SUSPENDED' ? 'ACTIVE' as const : u.status }
          : u
      )
    );
  };

  const deleteUser = (uid: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== uid));
  };

  const addUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    setUsers((prev) => [
      ...prev,
      {
        id: newId,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        status: 'PENDING' as const,
        lastLogin: '—',
        mfa: false,
        created: new Date().toISOString().split('T')[0],
      },
    ]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('VIEWER');
    setShowAddUser(false);
  };

  const toggleFeature = (tid: string) => {
    setToggles((prev) => prev.map((t) => (t.id === tid ? { ...t, enabled: !t.enabled } : t)));
  };

  const cycleRolePermission = (roleId: string, perm: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? { ...r, permissions: r.permissions.includes(perm) ? r.permissions.filter((p) => p !== perm) : [...r.permissions, perm] }
          : r
      )
    );
  };

  const filteredUsers = users.filter((u) => userFilter === 'ALL' || u.status === userFilter);
  const filteredToggles = toggles.filter((t) => toggleCategory === 'ALL' || t.category === toggleCategory);
  const paginatedActivity = activity.slice(activityPage * ACTIVITY_PER_PAGE, (activityPage + 1) * ACTIVITY_PER_PAGE);
  const totalPages = Math.ceil(activity.length / ACTIVITY_PER_PAGE);

  const allPermissions = ['all.read', 'all.write', 'all.delete', 'users.manage', 'roles.manage', 'system.config', 'audit.export', 'transactions.read', 'analysis.read', 'analysis.write', 'network.read', 'network.write', 'security.read'];
  const toggleCategories = ['ALL', ...Array.from(new Set(toggles.map((t) => t.category)))];

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col border-r border-white/5 bg-[#0D0D14] transition-all duration-300"
        style={{ width: sidebarOpen ? 240 : 64 }}
      >
        <div className="flex items-center gap-2 px-4 h-16 border-b border-white/5">
          <Shield size={28} weight="fill" color="#00D4FF" />
          {sidebarOpen && <span className="text-lg font-bold tracking-wider text-[#00D4FF]">SENTINEL-X</span>}
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin';
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all text-sm font-medium ${
                  active
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>
        <div className="border-t border-white/5 p-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center">
                <User size={16} color="#00D4FF" />
              </div>
              <div>
                <div className="text-xs font-medium text-white/80">Sayan Bhattacharya</div>
                <div className="text-[10px] text-white/40 font-mono">SUPER_ADMIN</div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0D0D14] border border-white/10 flex items-center justify-center hover:border-[#00D4FF]/40 transition-colors"
        >
          {sidebarOpen ? <CaretLeft size={12} color="#00D4FF" /> : <CaretRight size={12} color="#00D4FF" />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarOpen ? 240 : 64 }}>
        <div className="p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-wider text-white">ADMIN PANEL</h1>
              <p className="text-white/40 text-sm mt-1">User management, roles, feature flags & activity log</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-[#0D0D14] border border-white/5 font-mono text-[#00D4FF] text-sm">
                <Clock size={14} className="inline mr-2" />
                {clock}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Total Users</span>
                <Users size={20} color="#00D4FF" weight="fill" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#00D4FF]">{users.length}</div>
            </div>
            <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Active Now</span>
                <Power size={20} color="#00FFB3" weight="fill" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#00FFB3]">
                {users.filter((u) => u.status === 'ACTIVE').length}
              </div>
            </div>
            <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Roles Defined</span>
                <Key size={20} color="#FFB800" weight="fill" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#FFB800]">{roles.length}</div>
            </div>
            <div className="rounded-xl bg-[#0D0D14] border border-white/5 p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Features Active</span>
                <Lightning size={20} color="#FF6B00" weight="fill" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#FF6B00]">
                {toggles.filter((t) => t.enabled).length}/{toggles.length}
              </div>
            </div>
          </div>

          {/* Tabbed Section */}
          <div className="rounded-xl bg-[#0D0D14] border border-white/5">
            <div className="flex border-b border-white/5">
              {[
                { key: 'users' as const, label: 'User Management', count: users.length },
                { key: 'roles' as const, label: 'Role Editor', count: roles.length },
                { key: 'toggles' as const, label: 'Feature Toggles', count: toggles.length },
                { key: 'activity' as const, label: 'Activity Log', count: activity.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.key
                      ? 'text-[#00D4FF] border-[#00D4FF]'
                      : 'text-white/40 border-transparent hover:text-white/60'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs font-mono opacity-50">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    {['ALL', 'ACTIVE', 'SUSPENDED', 'PENDING'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setUserFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          userFilter === f
                            ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                            : 'bg-white/5 text-white/40 hover:text-white/60 border border-transparent'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAddUser(!showAddUser)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#00FFB3]/10 text-[#00FFB3] border border-[#00FFB3]/20 hover:bg-[#00FFB3]/20 transition-all flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add User
                  </button>
                </div>

                {showAddUser && (
                  <div className="mb-4 p-4 rounded-lg bg-[#0A0A0F] border border-[#00FFB3]/20">
                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/30 focus:border-[#00D4FF]/40 focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/30 focus:border-[#00D4FF]/40 focus:outline-none"
                      />
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:border-[#00D4FF]/40 focus:outline-none"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.name} className="bg-[#0D0D14]">
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={addUser}
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-[#00FFB3]/10 text-[#00FFB3] border border-[#00FFB3]/20 hover:bg-[#00FFB3]/20 transition-all"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => setShowAddUser(false)}
                          className="px-3 py-2 rounded-lg text-xs font-medium bg-white/5 text-white/40 hover:text-white/60 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30 border-b border-white/5">
                      <th className="text-left py-2 font-medium">ID</th>
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-left py-2 font-medium">Email</th>
                      <th className="text-left py-2 font-medium">Role</th>
                      <th className="text-center py-2 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">Last Login</th>
                      <th className="text-center py-2 font-medium">MFA</th>
                      <th className="text-center py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-mono text-[#00D4FF]">{u.id}</td>
                        <td className="py-3 text-white/70">{u.name}</td>
                        <td className="py-3 text-white/40">{u.email}</td>
                        <td className="py-3">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              color: roles.find((r) => r.name === u.role)?.color || '#fff',
                              backgroundColor: `${roles.find((r) => r.name === u.role)?.color || '#fff'}15`,
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              color: STATUS_COLORS[u.status],
                              backgroundColor: `${STATUS_COLORS[u.status]}15`,
                              border: `1px solid ${STATUS_COLORS[u.status]}30`,
                            }}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-white/40">{u.lastLogin}</td>
                        <td className="py-3 text-center">
                          {u.mfa ? (
                            <CheckCircle size={16} color="#00FFB3" weight="fill" />
                          ) : (
                            <WarningCircle size={16} color="#FF6B00" weight="fill" />
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className="p-1.5 rounded hover:bg-white/5 transition-colors"
                              title={u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            >
                              {u.status === 'ACTIVE' ? (
                                <UserMinus size={14} color="#FFB800" />
                              ) : (
                                <UserPlus size={14} color="#00FFB3" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 rounded hover:bg-[#FF2D55]/10 transition-colors"
                              title="Delete user"
                            >
                              <Trash size={14} color="#FF2D55" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <div className="p-5">
                <div className="grid grid-cols-1 gap-4">
                  {roles.map((role) => (
                    <div key={role.id} className="rounded-lg bg-[#0A0A0F] border border-white/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          <span className="text-sm font-bold font-mono" style={{ color: role.color }}>
                            {role.name}
                          </span>
                          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">
                            {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => setEditingRole(editingRole === role.id ? null : role.id)}
                          className={`px-3 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                            editingRole === role.id
                              ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                              : 'bg-white/5 text-white/40 hover:text-white/60'
                          }`}
                        >
                          <Pencil size={12} />
                          {editingRole === role.id ? 'Done' : 'Edit'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(editingRole === role.id ? allPermissions : role.permissions).map((perm) => {
                          const hasPerm = role.permissions.includes(perm);
                          return (
                            <button
                              key={perm}
                              onClick={() => editingRole === role.id && cycleRolePermission(role.id, perm)}
                              className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                                hasPerm
                                  ? 'bg-white/5 text-white/60 border border-white/10'
                                  : editingRole === role.id
                                  ? 'bg-white/[0.02] text-white/20 border border-white/[0.03] hover:border-white/10 cursor-pointer'
                                  : 'hidden'
                              }`}
                              disabled={editingRole !== role.id}
                            >
                              {hasPerm && <CheckCircle size={10} className="inline mr-1" color="#00FFB3" weight="fill" />}
                              {perm}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggles Tab */}
            {activeTab === 'toggles' && (
              <div className="p-5">
                <div className="flex gap-2 mb-4">
                  {toggleCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setToggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        toggleCategory === cat
                          ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                          : 'bg-white/5 text-white/40 hover:text-white/60 border border-transparent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {filteredToggles.map((t) => (
                    <div
                      key={t.id}
                      className={`rounded-lg border p-4 transition-all ${
                        t.enabled
                          ? 'bg-[#0A0A0F] border-[#00FFB3]/10'
                          : 'bg-[#0A0A0F] border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/80">{t.name}</span>
                          <span className="text-[9px] font-mono text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
                            {t.category}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleFeature(t.id)}
                          className="transition-all hover:scale-110"
                        >
                          {t.enabled ? (
                            <ToggleRight size={28} color="#00FFB3" weight="fill" />
                          ) : (
                            <ToggleLeft size={28} color="#ffffff30" weight="fill" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-white/30">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <div className="p-5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30 border-b border-white/5">
                      <th className="text-left py-2 font-medium">Time</th>
                      <th className="text-left py-2 font-medium">Actor</th>
                      <th className="text-left py-2 font-medium">Action</th>
                      <th className="text-left py-2 font-medium">Target</th>
                      <th className="text-center py-2 font-medium">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedActivity.map((a) => (
                      <tr key={a.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-mono text-white/40">{a.time}</td>
                        <td className="py-3">
                          <span className={`${a.actor === 'system' ? 'text-[#00D4FF]/60 italic' : 'text-white/70'}`}>
                            {a.actor}
                          </span>
                        </td>
                        <td className="py-3 text-white/60">{a.action}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/40">
                            {a.target}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              color: SEVERITY_COLORS[a.severity],
                              backgroundColor: `${SEVERITY_COLORS[a.severity]}15`,
                              border: `1px solid ${SEVERITY_COLORS[a.severity]}30`,
                            }}
                          >
                            {a.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <span className="text-xs text-white/30">
                    Showing {activityPage * ACTIVITY_PER_PAGE + 1}–{Math.min((activityPage + 1) * ACTIVITY_PER_PAGE, activity.length)} of {activity.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActivityPage((p) => Math.max(0, p - 1))}
                      disabled={activityPage === 0}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        activityPage === 0
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-white/5 text-white/40 hover:text-white/60'
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivityPage(i)}
                        className={`w-8 h-8 rounded-lg text-[11px] font-medium transition-all ${
                          activityPage === i
                            ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
                            : 'bg-white/5 text-white/40 hover:text-white/60'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setActivityPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={activityPage >= totalPages - 1}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        activityPage >= totalPages - 1
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-white/5 text-white/40 hover:text-white/60'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
