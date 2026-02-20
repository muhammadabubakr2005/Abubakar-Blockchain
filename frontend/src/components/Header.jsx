// src/components/Header.jsx
import React from 'react';

const S = {
  header: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '36px 24px 28px',
    borderBottom: '1px solid var(--border)',
    background: 'linear-gradient(180deg, rgba(0,229,255,0.05) 0%, transparent 100%)',
  },
  h1: {
    fontFamily: "'Orbitron', monospace",
    fontSize: 'clamp(22px, 5vw, 48px)',
    fontWeight: 900,
    color: 'var(--accent)',
    textShadow: 'var(--glow)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: "'Share Tech Mono', monospace",
    color: 'var(--muted)',
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 2,
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 32,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  stat: { textAlign: 'center' },
  statVal: {
    fontFamily: "'Orbitron', monospace",
    fontSize: 24,
    color: 'var(--accent)',
    textShadow: 'var(--glow)',
  },
  statLbl: {
    fontSize: 11,
    letterSpacing: 2,
    color: 'var(--muted)',
    textTransform: 'uppercase',
  },
  offline: {
    display: 'inline-block',
    marginTop: 10,
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    color: 'var(--danger)',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 3,
    padding: '4px 14px',
  },
};

const STATS = [
  { key: 'blocks',       label: 'Blocks'        },
  { key: 'transactions', label: 'Transactions'  },
  { key: 'difficulty',   label: 'Difficulty'    },
  { key: 'pending',      label: 'Pending'       },
];

export default function Header({ stats, connected }) {
  return (
    <header style={S.header}>
      <h1 style={S.h1}>⛓ Abubakar Blockchain</h1>
      <p style={S.subtitle}>DECENTRALIZED • IMMUTABLE • TRANSPARENT</p>

      {!connected && (
        <span style={S.offline}>
          ⚠ Cannot reach server — start the Go backend on :8080
        </span>
      )}

      <div style={S.statsRow}>
        {STATS.map(({ key, label }) => (
          <div key={key} style={S.stat}>
            <div style={S.statVal}>{stats[key]}</div>
            <div style={S.statLbl}>{label}</div>
          </div>
        ))}
      </div>
    </header>
  );
}