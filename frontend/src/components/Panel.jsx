// src/components/Panel.jsx
import React from 'react';

const S = {
  panel: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  topAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
    opacity: 0.6,
    pointerEvents: 'none',
  },
  panelHeader: {
    background: 'var(--surface2)',
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  icon: { fontSize: 18 },
  title: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
  body: { padding: 20 },
};

/**
 * Reusable panel shell used by every feature card.
 *
 * Props:
 *   icon        – emoji or string shown left of the title
 *   title       – panel heading text
 *   headerExtra – optional JSX rendered right-aligned in the header
 *   fullWidth   – spans both grid columns when true
 *   children    – panel body content
 */
export default function Panel({ icon, title, children, headerExtra, fullWidth }) {
  return (
    <div
      style={{
        ...S.panel,
        ...(fullWidth ? { gridColumn: '1 / -1' } : {}),
      }}
    >
      {/* Top coloured accent line */}
      <div style={S.topAccent} />

      {/* Header row */}
      <div style={S.panelHeader}>
        <span style={S.icon}>{icon}</span>
        <h2 style={S.title}>{title}</h2>
        {headerExtra && (
          <div style={{ marginLeft: 'auto' }}>{headerExtra}</div>
        )}
      </div>

      {/* Body */}
      <div style={S.body}>{children}</div>
    </div>
  );
}