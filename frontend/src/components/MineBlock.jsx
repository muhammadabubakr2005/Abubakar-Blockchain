// src/components/MineBlock.jsx
import React, { useState } from 'react';
import Panel from './Panel';
import Button from './Button';
import StatusMessage from './StatusMessage';

const S = {
  description: {
    fontSize: 14,
    color: 'var(--muted)',
    lineHeight: 1.7,
    marginBottom: 18,
  },
  highlight: { color: 'var(--text)', fontWeight: 600 },
  code: {
    fontFamily: "'Share Tech Mono', monospace",
    color: 'var(--accent)',
    background: 'rgba(0,229,255,0.06)',
    padding: '1px 6px',
    borderRadius: 2,
    fontSize: 13,
  },
  infoRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  infoBadge: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    letterSpacing: 1,
    padding: '5px 12px',
    borderRadius: 3,
  },
  pendingBadge: (hasPending) => ({
    border: `1px solid ${hasPending ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
    color: hasPending ? 'var(--accent3)' : 'var(--muted)',
    background: hasPending ? 'rgba(16,185,129,0.06)' : 'transparent',
  }),
  diffBadge: {
    border: '1px solid rgba(0,229,255,0.2)',
    color: 'var(--accent)',
    background: 'rgba(0,229,255,0.04)',
  },
};

/**
 * Panel containing the Mine button and a description of Proof of Work.
 *
 * Props:
 *   pending – string[] list of pending transactions
 *   onMine  – async () => { success: boolean, block?: Block, message?: string }
 *   mining  – boolean true while the backend is computing
 */
export default function MineBlock({ pending = [], onMine, mining }) {
  const [msg, setMsg] = useState(null);

  const handleMine = async () => {
    const res = await onMine();
    if (res.success) {
      setMsg({
        type: 'success',
        text: `✓ Block #${res.block.index} mined!  Nonce: ${res.block.nonce}  |  Hash: ${res.block.hash.slice(0, 20)}...`,
      });
    } else {
      setMsg({ type: 'error', text: '⚠ ' + res.message });
    }
    setTimeout(() => setMsg(null), 5000);
  };

  const hasPending = pending.length > 0;

  return (
    <Panel icon="⛏" title="Mine Block">
      <p style={S.description}>
        Mining uses <span style={S.highlight}>Proof of Work</span> — the server
        increments a nonce until the block's SHA-256 hash starts with{' '}
        <code style={S.code}>000</code>. All pending transactions are secured
        in a <span style={S.highlight}>Merkle tree</span> before hashing.
      </p>

      <div style={S.infoRow}>
        <span style={{ ...S.infoBadge, ...S.pendingBadge(hasPending) }}>
          {hasPending
            ? `${pending.length} tx${pending.length > 1 ? 's' : ''} pending`
            : 'No pending transactions'}
        </span>
        <span style={{ ...S.infoBadge, ...S.diffBadge }}>Difficulty · 3</span>
        <span style={{ ...S.infoBadge, ...S.diffBadge }}>SHA-256</span>
      </div>

      <Button
        variant="mine"
        onClick={handleMine}
        disabled={mining || !hasPending}
      >
        {mining ? '⏳ MINING...' : '⛏ MINE BLOCK'}
      </Button>

      <StatusMessage type={msg?.type}>{msg?.text}</StatusMessage>
    </Panel>
  );
}