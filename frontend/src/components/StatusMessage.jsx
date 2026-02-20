// src/components/StatusMessage.jsx
import React from 'react';

const TYPE_STYLES = {
  success: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    color: 'var(--accent3)',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: 'var(--danger)',
  },
  info: {
    background: 'rgba(0,229,255,0.06)',
    border: '1px solid rgba(0,229,255,0.2)',
    color: 'var(--accent)',
  },
};

const BASE = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 3,
  marginTop: 10,
  lineHeight: 1.6,
};

/**
 * Inline status / feedback bar.
 *
 * Props:
 *   type     – 'success' | 'error' | 'info'  (default: 'info')
 *   children – message text or JSX
 *
 * Returns null when children is falsy so callers don't need a conditional.
 */
export default function StatusMessage({ type = 'info', children }) {
  if (!children) return null;
  return (
    <div style={{ ...BASE, ...(TYPE_STYLES[type] || TYPE_STYLES.info) }}>
      {children}
    </div>
  );
}