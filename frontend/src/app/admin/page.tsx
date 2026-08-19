'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  ChartBar,
  Gear,
  MagnifyingGlass,
  CaretDown,
  Eye,
  UserMinus,
  Trash,
  Activity,
  Heartbeat,
  Warning,
  SignOut,
  House,
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/hooks/useAuth';

interface UserRecord {
  _id: string;
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  status: string;
  createdAt: string;
  last_login?: string;
  lastLoginAt?: string;
  passkey_count?: number;
}

interface AdminStats {
  totalUsers: number;
  activeToday: number;
  threatsBlocked: number;
  systemHealth: string;
}

const ADMIN_EMAIL = 'sayanbhatt2005@gmail.com';

const NAV_ITEMS = [
  { icon: ChartBar, label: 'Dashboard', href: '/admin', active: true },
  { icon: Users, label: 'Users', href: '/admin', active: false },
  { icon: Activity, label: 'Activity', href: '/admin', active: false },
  { icon: Gear, label: 'Settings', href: '/admin', active: false },
];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeToday: 0, threatsBlocked: 0, systemHealth: 'Optimal' });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fetching, setFetching] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isAdmin = user && (user.role === 'ADMIN' || user.email === ADMIN_EMAIL);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    } else if (!loading && user && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [loading, user, isAdmin, router]);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setFetching(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchUsers]);

  const handleSuspend = async (userId: string, currentStatus: string) => {
    setActionBusy(userId);
    try {
      const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionBusy(null);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}" and all their data? This cannot be undone.`)) return;
    setActionBusy(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setActionBusy(null);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredUsers = users;

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#E2E8F0] flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-[rgba(0,212,255,0.08)] bg-[rgba(6,11,24,0.95)] flex flex-col min-h-screen sticky top-0">
        <div className="p-6 border-b border-[rgba(0,212,255,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] glow-cyan">
              <ShieldCheck size={18} weight="fill" className="text-[#00D4FF]" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight terminal-text">SENTINEL<span className="text-[#00D4FF]">-X</span></span>
              <div className="text-[9px] tracking-[0.2em] uppercase text-[rgba(148,163,184,0.4)] terminal-text">Admin Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <div className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm terminal-text ${item.active ? 'active' : 'text-[rgba(148,163,184,0.5)] hover:text-[#E2E8F0]'}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(0,212,255,0.08)]">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-[rgba(148,163,184,0.5)] hover:text-[#00D4FF] terminal-text transition-colors cursor-pointer">
              <House size={14} />
              Back to Dashboard
            </div>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-xs text-[rgba(255,45,85,0.6)] hover:text-[#FF2D55] terminal-text transition-colors w-full mt-1"
          >
            <SignOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="terminal-text text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-[rgba(148,163,184,0.4)] terminal-text mt-1">User management and system oversight</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,255,179,0.2)] bg-[rgba(0,255,179,0.05)]">
              <div className="w-2 h-2 rounded-full bg-[#00FFB3] animate-pulse" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#00FFB3] terminal-text font-bold">Online</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
              <span className="text-xs font-bold text-[#00D4FF]">{user?.name?.charAt(0) || 'A'}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.06)]">
            <Warning size={16} className="text-[#FF2D55]" />
            <span className="terminal-text text-sm text-[#FF2D55]">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-[#FF2D55] hover:text-white text-xs">dismiss</button>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#00D4FF' },
            { label: 'Active Today', value: stats.activeToday, icon: Activity, color: '#00FFB3' },
            { label: 'Threats Blocked', value: stats.threatsBlocked, icon: ShieldCheck, color: '#FF2D55' },
            { label: 'System Health', value: stats.systemHealth, icon: Heartbeat, color: '#00FFB3' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="border border-[rgba(0,212,255,0.08)] bg-[rgba(10,15,30,0.7)] rounded-xl p-5 backdrop-blur-xl card-hover">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[rgba(148,163,184,0.4)] terminal-text">{stat.label}</span>
                  <Icon size={18} style={{ color: stat.color }} className="opacity-60" />
                </div>
                <div className="terminal-text text-2xl font-bold" style={{ color: stat.color }}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Search & Filter Bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(148,163,184,0.4)]" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[rgba(0,212,255,0.1)] bg-[rgba(10,15,30,0.6)] text-sm terminal-text text-[#E2E8F0] placeholder:text-[rgba(148,163,184,0.3)] focus:outline-none focus:border-[rgba(0,212,255,0.3)] transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-[rgba(0,212,255,0.1)] bg-[rgba(10,15,30,0.6)] text-xs terminal-text text-[#E2E8F0] focus:outline-none focus:border-[rgba(0,212,255,0.3)] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="ANALYST">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
            <CaretDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(148,163,184,0.4)] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-[rgba(0,212,255,0.1)] bg-[rgba(10,15,30,0.6)] text-xs terminal-text text-[#E2E8F0] focus:outline-none focus:border-[rgba(0,212,255,0.3)] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <CaretDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(148,163,184,0.4)] pointer-events-none" />
          </div>

          <button onClick={fetchUsers} className="px-4 py-2.5 rounded-lg border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)] text-[#00D4FF] text-xs terminal-text font-bold hover:bg-[rgba(0,212,255,0.12)] transition-colors">
            Refresh
          </button>
        </div>

        {/* ── User Table ── */}
        <div className="border border-[rgba(0,212,255,0.08)] rounded-xl bg-[rgba(10,15,30,0.5)] backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.08)]">
                  {['User', 'Email', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] tracking-[0.2em] uppercase text-[rgba(148,163,184,0.4)] terminal-text font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="w-6 h-6 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-xs text-[rgba(148,163,184,0.4)] terminal-text">Loading users...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-xs text-[rgba(148,163,184,0.4)] terminal-text">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const lastLogin = u.last_login || u.lastLoginAt;
                    const status = u.status || 'active';
                    return (
                      <tr key={u.user_id || u._id} className="border-b border-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                        {/* Avatar + Name */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {u.picture ? (
                              <img src={u.picture} alt="" className="w-8 h-8 rounded-full border border-[rgba(0,212,255,0.15)]" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.15)] flex items-center justify-center">
                                <span className="text-xs font-bold text-[#00D4FF]">{u.name?.charAt(0) || '?'}</span>
                              </div>
                            )}
                            <span className="text-sm font-medium">{u.name || 'Unknown'}</span>
                          </div>
                        </td>
                        {/* Email */}
                        <td className="px-5 py-3 text-xs text-[rgba(148,163,184,0.5)] terminal-text">{u.email}</td>
                        {/* Role */}
                        <td className="px-5 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-[10px] tracking-[0.15em] uppercase terminal-text font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-[rgba(0,212,255,0.1)] text-[#00D4FF] border border-[rgba(0,212,255,0.2)]'
                              : 'bg-[rgba(0,255,179,0.08)] text-[#00FFB3] border border-[rgba(0,255,179,0.15)]'
                          }`}>
                            {u.role || 'analyst'}
                          </span>
                        </td>
                        {/* Last Login */}
                        <td className="px-5 py-3 text-xs text-[rgba(148,163,184,0.4)] terminal-text">
                          {lastLogin ? new Date(lastLogin).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status === 'suspended' ? 'bg-[#FF2D55]' : 'bg-[#00FFB3]'}`} />
                            <span className={`text-[10px] tracking-[0.15em] uppercase terminal-text font-bold ${status === 'suspended' ? 'text-[#FF2D55]' : 'text-[#00FFB3]'}`}>
                              {status}
                            </span>
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/users/${u.user_id || u._id}`}>
                              <button className="p-1.5 rounded hover:bg-[rgba(0,212,255,0.1)] text-[rgba(148,163,184,0.5)] hover:text-[#00D4FF] transition-colors" title="View Details">
                                <Eye size={16} />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleSuspend(u.user_id || u._id, status)}
                              disabled={actionBusy === (u.user_id || u._id)}
                              className="p-1.5 rounded hover:bg-[rgba(255,184,0,0.1)] text-[rgba(148,163,184,0.5)] hover:text-[#FFB800] transition-colors disabled:opacity-40"
                              title={status === 'suspended' ? 'Reactivate' : 'Suspend'}
                            >
                              <UserMinus size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(u.user_id || u._id, u.name)}
                              disabled={actionBusy === (u.user_id || u._id)}
                              className="p-1.5 rounded hover:bg-[rgba(255,45,85,0.1)] text-[rgba(148,163,184,0.5)] hover:text-[#FF2D55] transition-colors disabled:opacity-40"
                              title="Delete User"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
