import { Db } from 'mongodb';
import { generateTransaction } from './txgen';
import { generateId } from '../utils';

let ready = false;

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection('transactions').createIndex({ timestamp: -1 }),
    db.collection('audit_logs').createIndex({ timestamp: -1 }),
    db.collection('user_sessions').createIndex({ session_token: 1 }),
    db.collection('passkeys').createIndex({ id: 1 }),
    db.collection('webauthn_challenges').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('users').createIndex({ email: 1 }),
  ]);
}

export async function ensureSeeded(db: Db) {
  if (ready) return;
  await ensureIndexes(db);

  const count = await db.collection('transactions').estimatedDocumentCount();
  if (count === 0) {
    const now = Date.now();
    const txs = Array.from({ length: 140 }, () =>
      generateTransaction({ timestamp: now - Math.floor(Math.random() * 48 * 3600 * 1000) })
    );
    await db.collection('transactions').insertMany(txs.map(t => ({ ...t })));

    await db.collection('gateways').insertMany([
      { id: 'GW-001', name: 'PRIMARY-VAULT', protocol: 'TLS_1_3', status: 'ONLINE', latency: 12, encryptionBits: 256, lastChecked: now },
      { id: 'GW-002', name: 'BACKUP-NODE', protocol: 'TLS_1_2', status: 'ONLINE', latency: 34, encryptionBits: 256, lastChecked: now },
      { id: 'GW-003', name: 'OFFSHORE-RELAY', protocol: 'ENCRYPTED', status: 'DEGRADED', latency: 189, encryptionBits: 128, lastChecked: now - 60000 },
      { id: 'GW-004', name: 'EU-CENTRAL-GATE', protocol: 'TLS_1_3', status: 'ONLINE', latency: 22, encryptionBits: 256, lastChecked: now },
    ]);

    const risky = [...txs].sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);
    await db.collection('alerts').insertMany(
      risky.map((tx, i) => ({
        id: generateId(),
        timestamp: tx.timestamp,
        level: tx.threatLevel,
        message: `${tx.flags[0] ?? 'RISK_SIGNAL'} detected on ${tx.sender} → ${tx.receiver} (${tx.currency} ${tx.amount.toLocaleString()})`,
        source: 'FORENSIC_ENGINE_V4',
        resolved: i >= 4,
        transactionId: tx.id,
      }))
    );

    const flagged = txs.filter(t => t.status === 'FLAGGED' || t.status === 'BLOCKED').slice(0, 30);
    const systemLogs = flagged.map(tx => ({
      id: generateId(),
      timestamp: tx.timestamp + 1500,
      action: tx.status === 'BLOCKED' ? 'BLOCK_TRANSACTION' : 'FLAG_TRANSACTION',
      actor: 'FORENSIC-ENGINE',
      target: tx.id,
      severity: tx.threatLevel,
      details: `Automated ${tx.status === 'BLOCKED' ? 'block' : 'flag'}: risk score ${tx.riskScore} [${tx.flags.join(', ') || 'BASELINE'}]`,
      ipAddress: '10.0.0.4',
      sessionId: 'SYSTEM',
    }));
    systemLogs.push({
      id: generateId(),
      timestamp: now - 49 * 3600 * 1000,
      action: 'SYSTEM_BOOT',
      actor: 'SENTINEL-X',
      target: 'CORE',
      severity: 'CLEAR',
      details: 'Forensic platform initialized. All modules operational.',
      ipAddress: '10.0.0.1',
      sessionId: 'SYSTEM',
    });
    await db.collection('audit_logs').insertMany(systemLogs);
  }
  ready = true;
}
