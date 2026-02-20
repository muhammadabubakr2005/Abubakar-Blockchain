// src/components/Button.jsx
import React from 'react';

/**
 * Variant styles.
 * Each key maps to the extra CSS applied on top of the shared base.
 */
const VARIANTS = {
  primary: {
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
    boxShadow: '0 0 12px rgba(0,229,255,0.15)',
  },
  mine: {
    borderColor: 'var(--accent2)',
    color: 'var(--accent2)',
    boxShadow: '0 0 12px rgba(124,58,237,0.2)',
    width: '100%',
    justifyContent: 'center',
    padding: '14px 22px',
    fontSize: 14,
  },
  search: {
    borderColor: 'var(--accent3)',
    color: 'var(--accent3)',
    boxShadow: '0 0 12px rgba(16,185,129,0.1)',
  },
  danger: {
    borderColor: 'var(--danger)',
    color: 'var(--danger)',
    boxShadow: '0 0 12px rgba(239,68,68,0.15)',
  },
};

const BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 22px',
  border: '1px solid',
  borderRadius: 3,
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 13,
  letterSpacing: 2,
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'all 0.2s',
  background: 'transparent',
  outline: 'none',
  whiteSpace: 'nowrap',
};

const DISABLED = {
  opacity: 0.4,
  cursor: 'not-allowed',
  pointerEvents: 'none',
};

/**
 * Styled button.
 *
 * Props:
 *   variant  – 'primary' | 'mine' | 'search' | 'danger'  (default: 'primary')
 *   disabled – greys out and blocks interaction
 *   onClick  – click handler
 *   style    – additional inline styles
 *   children – button label / content
 */
export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  style,
}) {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      style={{
        ...BASE,
        ...variantStyle,
        ...(disabled ? DISABLED : {}),
        ...style,
      }}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}