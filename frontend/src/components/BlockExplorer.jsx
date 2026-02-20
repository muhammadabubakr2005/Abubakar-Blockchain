// src/components/BlockExplorer.jsx
import React from 'react';
import Panel from './Panel';
import Button from './Button';
import BlockCard from './BlockCard';

const S = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  connector: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    margin: '-4px 0',
    opacity: 0.45,
  },
  connectorLine: {
    flex: 1,
    height: 1,
    background: 'var(--border)',
    maxWidth: 80,
  },
  connectorArrow: {
    color: 'var(--muted)',
    fontSize: 14,
  },
  empty: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13,
    textAlign: 'center',
    padding: '32px 0',
    color: 'var(--muted)',
    letterSpacing: 1,
  },
  countBadge: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    letterSpacing: 2,
    color: 'var(--muted)',
    background: 'rgba(0,229,255,0.04)',
    border: '1px solid var(--border)',
    borderRadius: 2,
    padding: '3px 10px',
  },
};

/**
 * Scrollable explorer showing every block in the chain, newest first.
 *
 * Props:
 *   chain     – Block[] array from the hook
 *   onRefresh – callback to re-fetch the chain
 */
export default function BlockExplorer({ chain = [], onRefresh }) {
  const headerExtra = (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {chain.length > 0 && (
        <span style={S.countBadge}>{chain.length} BLOCK{chain.length !== 1 ? 'S' : ''}</span>
      )}
      <Button
        onClick={onRefresh}
        style={{ padding: '6px 14px', fontSize: 11 }}
      >
        ↻ REFRESH
      </Button>
    </div>
  );

  return (
    <Panel icon="🔗" title="Blockchain Explorer" headerExtra={headerExtra} fullWidth>
      <div style={S.container}>
        {chain.length === 0 ? (
          <div style={S.empty}>⏳ Loading chain...</div>
        ) : (
          [...chain].reverse().map((block, i) => (
            <React.Fragment key={block.index}>
              {/* Chain link connector between cards */}
              {i > 0 && (
                <div style={S.connector}>
                  <div style={S.connectorLine} />
                  <span style={S.connectorArrow}>▲</span>
                  <div style={S.connectorLine} />
                </div>
              )}
              <BlockCard block={block} />
            </React.Fragment>
          ))
        )}
      </div>
    </Panel>
  );
}