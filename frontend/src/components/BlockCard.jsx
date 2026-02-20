// src/components/BlockCard.jsx
import React, { useState } from 'react';

const S = {
  card: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    overflow: 'hidden',
    animation: 'blockAppear 0.4s ease',
    transition: 'border-color 0.2s',
  },
  cardGenesis: {
    borderColor: 'rgba(0,229,255,0.45)',
    boxShadow: '0 0 20px rgba(0,229,255,0.05)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'var(--surface2)',
    cursor: 'pointer',
    userSelect: 'none',
    gap: 10,
    transition: 'background 0.15s',
  },
  indexBadge: {
    fontFamily: "'Orbitron', monospace",
    fontSize: 13,
    color: 'var(--accent)',
    background: 'rgba(0,229,255,0.08)',
    border: '1px solid rgba(0,229,255,0.2)',
    padding: '3px 10px',
    borderRadius: 2,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  genesisBadge: {
    fontSize: 10,
    letterSpacing: 2,
    color: 'var(--accent)',
    border: '1px solid rgba(0,229,255,0.35)',
    padding: '2px 8px',
    borderRadius: 2,
    background: 'rgba(0,229,255,0.06)',
    flexShrink: 0,
  },
  hashPreview: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: 'var(--muted)',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    color: 'var(--muted)',
    fontSize: 11,
    transition: 'transform 0.2s',
    flexShrink: 0,
  },
  details: {
    padding: 16,
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 520,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '120px minmax(0, 1fr)',
    gap: 8,
    alignItems: 'start',
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'var(--muted)',
    paddingTop: 1,
    whiteSpace: 'nowrap',
  },
  fieldValue: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    color: 'var(--text)',
    wordBreak: 'break-all',
    overflowWrap: 'anywhere',
    lineHeight: 1.6,
    minWidth: 0,
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '4px 0',
  },
  txBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  txBadge: {
    background: 'rgba(0,229,255,0.05)',
    border: '1px solid rgba(0,229,255,0.15)',
    borderRadius: 2,
    padding: '3px 9px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    color: 'var(--text)',
  },
};

/** Renders one labelled field row inside the expanded block. */
function Field({ label, value, color }) {
  return (
    <div style={S.fieldRow}>
      <span style={S.fieldLabel}>{label}</span>
      <span style={{ ...S.fieldValue, ...(color ? { color } : {}) }}>
        {value}
      </span>
    </div>
  );
}

/**
 * Collapsible card displaying all fields of a single block.
 *
 * Props:
 *   block – Block object from the API
 */
export default function BlockCard({ block }) {
  const [open, setOpen] = useState(false);
  const isGenesis = block.index === 0;

  return (
    <div
      style={{
        ...S.card,
        ...(isGenesis ? S.cardGenesis : {}),
      }}
    >
      {/* ── Clickable header row ── */}
      <div style={S.headerRow} onClick={() => setOpen((o) => !o)}>
        <span style={S.indexBadge}>#{block.index}</span>
        {isGenesis && <span style={S.genesisBadge}>GENESIS</span>}
        <span style={S.hashPreview}>{block.hash}</span>
        <span
          style={{
            ...S.chevron,
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          ▼
        </span>
      </div>

      {/* ── Expanded detail section ── */}
      {open && (
        <div style={S.details}>
          <Field label="Index"       value={block.index} />
          <Field label="Timestamp"   value={block.timestamp} />
          <div style={S.divider} />
          <Field label="Nonce"       value={block.nonce}      color="var(--accent3)" />
          <Field label="Difficulty"  value={block.difficulty} />
          <div style={S.divider} />
          <Field
            label="Merkle Root"
            value={block.merkleRoot || 'N/A'}
            color="var(--accent2)"
          />
          <Field
            label="Prev Hash"
            value={block.prevHash}
            color="var(--muted)"
          />
          <Field
            label="Hash"
            value={block.hash}
            color="var(--accent)"
          />
          <div style={S.divider} />

          {/* Transactions */}
          <div style={S.fieldRow}>
            <span style={S.fieldLabel}>
              Tx&nbsp;({block.transactions.length})
            </span>
            <div style={S.txBadges}>
              {block.transactions.map((tx, i) => (
                <span key={i} style={S.txBadge}>
                  {tx}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}