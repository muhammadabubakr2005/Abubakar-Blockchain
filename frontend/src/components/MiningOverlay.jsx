// src/components/MiningOverlay.jsx
import React from 'react';

const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.88)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 24,
  },
  spinner: {
    width: 64,
    height: 64,
    border: '3px solid var(--border)',
    borderTopColor: 'var(--accent2)',
    borderRadius: '50%',
    animation: 'spin 0.75s linear infinite',
  },
  title: {
    fontFamily: "'Orbitron', monospace",
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--accent2)',
    textShadow: 'var(--glow2)',
    letterSpacing: 4,
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  subtitle: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13,
    color: 'var(--muted)',
    letterSpacing: 2,
  },
  badge: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: 'var(--accent)',
    background: 'rgba(0,229,255,0.06)',
    border: '1px solid rgba(0,229,255,0.2)',
    borderRadius: 3,
    padding: '4px 14px',
    letterSpacing: 2,
  },
};

/**
 * Full-screen overlay displayed while the Go backend mines a block.
 *
 * Props:
 *   active – when true the overlay is rendered; false returns null
 */
export default function MiningOverlay({ active }) {
  if (!active) return null;

  return (
    <div style={S.overlay}>
      <div style={S.spinner} />
      <div style={S.title}>MINING BLOCK...</div>
      <div style={S.subtitle}>Proof of Work in progress</div>
      <div style={S.badge}>DIFFICULTY · 3 · SHA-256</div>
    </div>
  );
}