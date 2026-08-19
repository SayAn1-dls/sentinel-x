'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowLeft,
  Fingerprint,
  Trash,
  UserMinus,
  Key,
  Clock,
  Warning,
  CheckCircle,
  User,
  Envelope,
  CalendarBlank,
  Activity,
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/hooks/useAuth';

const ADMIN_EMAIL = 'sayanbhatt2005@gmail.com';

interface UserDetail {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  status: string;
  createdAt?: string;
  last_login?: string;
  lastLoginAt?: string;
  passkeys?: Array<{
    id: string;
    label: string;
    createdAt: string;
    lastUsedAt?: string;
    deviceType?: string;
  }>;
}

interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  actor: string;
  target: string;
  severity: string;
  details: string;
}

export default function UserDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user && (user.role === 'ADMIN' || user.email === ADMIN_EMAIL);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
    else if (!loading && user && !isAdmin) router.replace('/dashboard');
  }, [loading, user, isAdmin, router]);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch user details');
      const data = await res.json();
      setDetail(data.user);
      setAuditLogs(data.auditLogs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load user');
    } finally {
      setFetching(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isAdmin && userId) fetchDetail();
  }, [isAdmin, userId, fetchDetail]);

  const handleSuspend = async () => {
    if (!detail) return;
    setActionBusy(true);
    setError('');
    setSuccess('');
    try {
      const newStatus = detail.status === 'suspended' ? 'active' : 'suspended';
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update user status');
      setSuccess(`User ${newStatus === 'suspended' ? 'suspended' : 'reactivated'} successfully.`);
      await fetchDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (!confirm(`Permanently delete "${detail.name}" and all their data? This cannot be undone.`)) return;
    setActionBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      router.replace('/admin');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      setActionBusy(false);
    }
  };

  const handleRevokePasskey = async (passkeyId: string) => {
    if (!confirm('Revoke this passkey? The user will need to re-register it.')) return;
    setActionBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revokePasskey: passkeyId }),
      });
      if (!res.ok) throw new Error('Failed to revoke passkey');
      setSuccess('Passkey revoked successfully.');
      await fetchDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Revoke failed');
    } finally {
      setActionBusy(false);
    }
  };

  if (loading || !isAdmin || fetching) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center text-[rgba(148,163,184,0.5)] terminal-text">
        User not found
      </div>
    );
  }

  const lastLogin = detail.last_login || detail.lastLoginAt;
  const status = detail.status || 'active';
  const severityColor: Record<string, string> = {
    CRITICAL: 'text-[#FF2D55]',
    HIGH: 'text-[#FF6B00]',
    MEDIUM: 'text-[#FFB800]',
    LOW: 'text-[#00FFB3]',
    CLEAR: 'text-[#00D4FF]',
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#E2E8F0]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back nav */}
        <Link href="/admin">
          <button className="flex items-center gap-2 text-[rgba(148,163,184,0.5)] hover:text-[#00D4FF] terminal-text text-sm mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Admin Dashboard
          </button>
        </Link>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.06)]">
            <Warning size={16} className="text-[#FF2D55]" />
            <span className="terminal-text text-sm text-[#FF2D55]">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-[#FF2D55] hover:text-white text-xs">dismiss</button>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg border border-[rgba(0,255,179,0.2)] bg-[rgba(0,255,179,0.06)]">
            <CheckCircle size={16} className="text-[#00FFB3]" />
            <span className="terminal-text text-sm text-[#00FFB3]">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-[#00FFB3] hover:text-white text-xs">dismiss</button>
          </div>
        )}

        {/* ── User Profile Card ── */}
        <div className="border border-[rgba(0,212,255,0.1)] bg-[rgba(10,15,30,0.7)] rounded-xl p-6 mb-6 backdrop-blur-xl">
          <div className="flex items-start gap-5">
            {detail.picture ? (
              <img src={detail.picture} alt="" className="w-16 h-16 rounded-full border-2 border-[rgba(0,212,255,0.2)]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[rgba(0,212,255,0.1)] border-2 border-[rgba(0,212,255,0.2)] flex items-center justify-center">
                <User size={28} className="text-[#00D4FF]" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="terminal-text text-xl font-bold">{detail.name}</h2>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] tracking-[0.15em] uppercase terminal-text font-bold ${
                  detail.role === 'ADMIN'
                    ? 'bg-[rgba(0,212,255,0.1)] text-[#00D4FF] border border-[rgba(0,212,255,0.2)]'
                    : 'bg-[rgba(0,255,179,0.08)] text-[#00FFB3] border border-[rgba(0,255,179,0.15)]'
                }`}>
                  {detail.role}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${status === 'suspended' ? 'bg-[#FF2D55]' : 'bg-[#00FFB3]'}`} />
                  <span className={`text-[10px] tracking-[0.15em] uppercase terminal-text font-bold ${status === 'suspended' ? 'text-[#FF2D55]' : 'text-[#00FFB3]'}`}>
                    {status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-xs text-[rgba(148,163,184,0.5)]">
                  <Envelope size={14} className="text-[#00D4FF] opacity-50" />
                  <span className="terminal-text">{detail.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[rgba(148,163,184,0.5)]">
                  <CalendarBlank size={14} className="text-[#00D4FF] opacity-50" />
                  <span className="terminal-text">Joined {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[rgba(148,163,184,0.5)]">
                  <Clock size={14} className="text-[#00D4FF] opacity-50" />
                  <span className="terminal-text">Last login {lastLogin ? new Date(lastLogin).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ── Activity Timeline ── */}
          <div className="border border-[rgba(0,212,255,0.08)] bg-[rgba(10,15,30,0.6)] rounded-xl p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-[#00D4FF]" />
              <h3 className="terminal-text text-sm font-bold tracking-wide">Recent Activity</h3>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-[rgba(148,163,184,0.3)] terminal-text py-4">No recent activity recorded.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-[rgba(0,212,255,0.04)] last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityColor[log.severity] ? 'bg-current ' + severityColor[log.severity] : 'bg-[#00D4FF]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="terminal-text text-xs font-bold text-[#E2E8F0] truncate">{log.action}</span>
                        <span className="terminal-text text-[10px] text-[rgba(148,163,184,0.3)] shrink-0">
                          {new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="terminal-text text-[11px] text-[rgba(148,163,184,0.4)] mt-0.5 truncate">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Passkeys ── */}
          <div className="border border-[rgba(0,212,255,0.08)] bg-[rgba(10,15,30,0.6)] rounded-xl p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Key size={16} className="text-[#00D4FF]" />
              <h3 className="terminal-text text-sm font-bold tracking-wide">Registered Passkeys</h3>
            </div>

            {!detail.passkeys || detail.passkeys.length === 0 ? (
              <p className="text-xs text-[rgba(148,163,184,0.3)] terminal-text py-4">No biometric passkeys registered.</p>
            ) : (
              <div className="space-y-3">
                {detail.passkeys.map(pk => (
                  <div key={pk.id} className="flex items-center gap-3 py-3 px-3 rounded-lg border border-[rgba(0,212,255,0.06)] bg-[rgba(10,15,30,0.4)]">
                    <Fingerprint size={20} className="text-[#00D4FF] opacity-60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="terminal-text text-xs font-bold truncate">{pk.label || 'Passkey'}</div>
                      <div className="terminal-text text-[10px] text-[rgba(148,163,184,0.3)]">
                        Registered {pk.createdAt ? new Date(pk.createdAt).toLocaleDateString() : 'Unknown'}
                        {pk.lastUsedAt && ` · Last used ${new Date(pk.lastUsedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokePasskey(pk.id)}
                      disabled={actionBusy}
                      className="px-2.5 py-1 rounded text-[10px] tracking-[0.1em] uppercase terminal-text font-bold border border-[rgba(255,45,85,0.2)] text-[rgba(255,45,85,0.6)] hover:text-[#FF2D55] hover:border-[rgba(255,45,85,0.4)] hover:bg-[rgba(255,45,85,0.06)] transition-colors disabled:opacity-40"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Danger Zone ── */}
        <div className="border border-[rgba(255,45,85,0.15)] bg-[rgba(255,45,85,0.03)] rounded-xl p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <Warning size={16} className="text-[#FF2D55]" />
            <h3 className="terminal-text text-sm font-bold tracking-wide text-[#FF2D55]">Danger Zone</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSuspend}
              disabled={actionBusy}
              className="px-5 py-2.5 rounded-lg terminal-text font-bold text-xs tracking-[0.1em] uppercase border border-[rgba(255,184,0,0.3)] text-[#FFB800] bg-[rgba(255,184,0,0.06)] hover:bg-[rgba(255,184,0,0.12)] hover:border-[rgba(255,184,0,0.5)] transition-all disabled:opacity-40"
            >
              <div className="flex items-center gap-2">
                <UserMinus size={14} />
                {status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
              </div>
            </button>

            <button
              onClick={handleDelete}
              disabled={actionBusy}
              className="px-5 py-2.5 rounded-lg terminal-text font-bold text-xs tracking-[0.1em] uppercase border border-[rgba(255,45,85,0.3)] text-[#FF2D55] bg-[rgba(255,45,85,0.06)] hover:bg-[rgba(255,45,85,0.12)] hover:border-[rgba(255,45,85,0.5)] transition-all disabled:opacity-40"
            >
              <div className="flex items-center gap-2">
                <Trash size={14} />
                Delete Account
              </div>
            </button>
          </div>

          <p className="mt-3 terminal-text text-[10px] text-[rgba(255,45,85,0.4)]">
            Deleting an account permanently removes all user data, passkeys, sessions, and audit logs.
          </p>
        </div>
      </div>
    </div>
  );
}
