// src/components/AddTransaction.jsx
import React, { useState } from 'react';
import Panel from './Panel';
import Button from './Button';
import StatusMessage from './StatusMessage';

const S = {
  label: {
    display: 'block',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: 8,
  },
  textarea: {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 14,
    padding: '10px 14px',
    borderRadius: 3,
    outline: 'none',
    resize: 'vertical',
    minHeight: 84,
    marginBottom: 14,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  txList: {
    listStyle: 'none',
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    maxHeight: 200,
    overflowY: 'auto',
    paddingRight: 2,
  },
  txItem: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 3,
    padding: '8px 12px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13,
    color: 'var(--text)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    animation: 'slideIn 0.3s ease',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--accent3)',
    boxShadow: '0 0 6px var(--accent3)',
    flexShrink: 0,
  },
  poolHeading: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginTop: 16,
    marginBottom: 6,
  },
};

/**
 * Panel that lets the user type a transaction string and broadcast it
 * to the Go backend's pending pool.
 *
 * Props:
 *   pending  – string[] current pending transactions (shown as a list below the form)
 *   onAdd    – async (data: string) => { success: boolean, message: string }
 *   loading  – boolean while a request is in-flight
 */
export default function AddTransaction({ pending = [], onAdd, loading }) {
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState(null); // { type, text }

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setMsg({ type: 'error', text: '⚠ Please enter transaction data.' });
      return;
    }
    const res = await onAdd(trimmed);
    setMsg({
      type: res.success ? 'success' : 'error',
      text: res.success ? '✓ ' + res.message : '⚠ ' + res.message,
    });
    if (res.success) setValue('');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
  };

  return (
    <Panel icon="📝" title="Add Transaction">
      <label style={S.label}>Transaction Data</label>
      <textarea
        style={S.textarea}
        placeholder={"Enter transaction data...\ne.g. Alice sends 50 BTC to Bob\n(Ctrl+Enter to submit)"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
      />
      <Button onClick={handleSubmit} disabled={loading} variant="primary">
        ▶ BROADCAST TRANSACTION
      </Button>

      <StatusMessage type={msg?.type}>{msg?.text}</StatusMessage>

      {pending.length > 0 && (
        <>
          <p style={S.poolHeading}>Mempool · {pending.length} pending</p>
          <ul style={S.txList}>
            {pending.map((tx, i) => (
              <li key={i} style={S.txItem}>
                <span style={S.dot} />
                {tx}
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}