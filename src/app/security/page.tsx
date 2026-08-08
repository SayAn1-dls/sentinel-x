'use client';
import { useCallback, useEffect, useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Fingerprint, Trash, ShieldCheck, UserGear } from '@phosphor-icons/react';
import { AuthGate } from '@/components/auth/AuthGate';
import { ForensicHUD } from '@/components/hud/ForensicHUD';
import { SiliconCard } from '@/components/ui/SiliconCard';
import { useAuth, AuthUser } from '@/lib/hooks/useAuth';
import { formatTimestamp } from '@/lib/utils';

interface Passkey {
  id: string;
  label?: string;
  deviceType?: string;
  backedUp?: boolean;
  createdAt?: string;
  lastUsedAt?: string;
}

function PasskeyPanel() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/passkeys', { credentials: 'include' });
    if (res.ok) setPasskeys((await res.json()).data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const register = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const optRes = await fetch('/api/passkeys/register/options', { method: 'POST', credentials: 'include' });
      if (!optRes.ok) throw new Error('Could not start registration');
      const { options } = await optRes.json();
      const attestation = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch('/api/passkeys/register/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attestation),
      });
      if (!verifyRes.ok) throw new Error((await verifyRes.json()).error || 'Verification failed');
      setMessage({ type: 'ok', text: 'Biometric passkey registered. You can now use quick login.' });
      load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setMessage({ type: 'err', text: /NotAllowedError|abort|cancel|timed out/i.test(msg) ? 'Biometric prompt cancelled or unavailable on this device.' : msg });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/passkeys?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  return (
    <SiliconCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm flex items-center gap-2">
          <Fingerprint size={18} /> BIOMETRIC PASSKEYS
        </h2>
        <button
          onClick={register}
          disabled={busy}
          data-testid="register-passkey-btn"
          className="text-xs px-4 py-2 rounded-lg bg-orange-500 text-black font-black tracking-widest uppercase hover:bg-orange-400 transition-colors disabled:opacity-50"
        >
          {busy ? 'AWAITING SENSOR...' : '+ REGISTER THIS DEVICE'}
        </button>
      </div>
      {message && (
        <p className={`text-xs mb-4 ${message.type === 'ok' ? 'text-green-400' : 'text-red-400'}`} data-testid="passkey-message" role="status">
          {message.text}
        </p>
      )}
      {passkeys.length === 0 ? (
        <p className="text-white/30 text-xs uppercase tracking-wider" data-testid="no-passkeys">
          No passkeys registered. Add one to unlock fingerprint / Face ID quick login.
        </p>
      ) : (
        <div className="space-y-2">
          {passkeys.map(pk => (
            <div key={pk.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03]" data-testid="passkey-item">
              <div>
                <div className="text-white/80 text-sm font-bold">{pk.label ?? 'Passkey device'}</div>
                <div className="text-white/30 text-xs">
                  {pk.deviceType === 'multiDevice' ? 'Synced passkey' : 'Device-bound'} · Added {pk.createdAt ? formatTimestamp(new Date(pk.createdAt).getTime()) : '—'}
                  {pk.lastUsedAt ? ` · Last used ${formatTimestamp(new Date(pk.lastUsedAt).getTime())}` : ''}
                </div>
              </div>
              <button
                onClick={() => remove(pk.id)}
                data-testid="delete-passkey-btn"
                className="text-red-400 hover:text-red-300 p-2 rounded border border-red-500/20 hover:bg-red-500/10 transition-colors"
                aria-label="Remove passkey"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </SiliconCard>
  );
}

function AdminPanel({ me }: { me: AuthUser }) {
  const [users, setUsers] = useState<(AuthUser & { last_login?: string; created_at?: string })[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/users', { credentials: 'include' });
    if (res.ok) setUsers((await res.json()).data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleRole = async (u: AuthUser) => {
    setError('');
    const res = await fetch(`/api/users/${u.user_id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: u.role === 'ADMIN' ? 'ANALYST' : 'ADMIN' }),
    });
    if (!res.ok) setError((await res.json()).error || 'Update failed');
    load();
  };

  return (
    <SiliconCard>
      <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm flex items-center gap-2 mb-4">
        <UserGear size={18} /> OPERATIVES · ADMIN CONSOLE
      </h2>
      {error && <p className="text-red-400 text-xs mb-3" data-testid="admin-error">{error}</p>}
      <div className="space-y-2" data-testid="users-list">
        {users.map(u => (
          <div key={u.user_id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03]" data-testid="user-row">
            <div className="flex items-center gap-3 min-w-0">
              {u.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.picture} alt={u.name} className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-black">
                  {u.name?.[0] ?? '?'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-white/80 text-sm font-bold truncate">{u.name}{u.user_id === me.user_id ? ' (you)' : ''}</div>
                <div className="text-white/30 text-xs truncate">{u.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className="text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase"
                style={u.role === 'ADMIN'
                  ? { color: '#FF6B00', background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.4)' }
                  : { color: '#00CFFF', background: 'rgba(0,207,255,0.15)', border: '1px solid rgba(0,207,255,0.4)' }}
              >
                {u.role}
              </span>
              {u.user_id !== me.user_id && (
                <button
                  onClick={() => toggleRole(u)}
                  data-testid="toggle-role-btn"
                  className="text-[10px] px-3 py-1.5 rounded border border-white/20 text-white/60 hover:text-white hover:border-orange-500/60 tracking-widest uppercase transition-colors"
                >
                  {u.role === 'ADMIN' ? 'DEMOTE' : 'PROMOTE'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SiliconCard>
  );
}

function SecurityContent() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <main className="pt-16 px-6 pb-8 max-w-5xl mx-auto">
      <div className="py-6">
        <h1 className="text-3xl font-black text-orange-500 tracking-widest uppercase">SECURITY CONSOLE</h1>
        <p className="text-white/40 text-sm mt-1">Identity, biometrics & access control</p>
      </div>

      <div className="space-y-6">
        <SiliconCard>
          <h2 className="text-orange-500 font-black tracking-widest uppercase text-sm flex items-center gap-2 mb-4">
            <ShieldCheck size={18} /> OPERATIVE IDENTITY
          </h2>
          <div className="flex items-center gap-4" data-testid="account-info">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt={user.name} className="w-14 h-14 rounded-full border-2 border-orange-500/40" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xl font-black">
                {user.name?.[0] ?? '?'}
              </div>
            )}
            <div>
              <div className="text-white font-bold" data-testid="account-name">{user.name}</div>
              <div className="text-white/40 text-sm" data-testid="account-email">{user.email}</div>
            </div>
            <span
              className="ml-auto text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase"
              data-testid="account-role"
              style={user.role === 'ADMIN'
                ? { color: '#FF6B00', background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.4)' }
                : { color: '#00CFFF', background: 'rgba(0,207,255,0.15)', border: '1px solid rgba(0,207,255,0.4)' }}
            >
              {user.role} CLEARANCE
            </span>
          </div>
        </SiliconCard>

        <PasskeyPanel />

        {user.role === 'ADMIN' && <AdminPanel me={user} />}
      </div>
    </main>
  );
}

export default function SecurityPage() {
  return (
    <AuthGate>
      <div className="min-h-screen">
        <ForensicHUD />
        <SecurityContent />
      </div>
    </AuthGate>
  );
}
