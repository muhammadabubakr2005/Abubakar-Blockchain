// src/components/SearchPanel.jsx
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
  inputRow: {
    display: 'flex',
    gap: 10,
  },
  input: {
    flex: 1,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 14,
    padding: '10px 14px',
    borderRadius: 3,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    minWidth: 0,
  },
  results: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  resultCard: {
    background: 'var(--bg)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 3,
    padding: '10px 14px',
    animation: 'slideIn 0.3s ease',
  },
  resultLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: 'var(--accent3)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  resultTx: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13,
    color: 'var(--text)',
    wordBreak: 'break-all',
    lineHeight: 1.5,
  },
  empty: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13,
    color: 'var(--muted)',
    textAlign: 'center',
    padding: '20px 0',
    letterSpacing: 1,
  },
  countLine: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: 'var(--accent3)',
    letterSpacing: 2,
    marginBottom: 4,
  },
};

/**
 * Panel with a search input that queries all blocks for matching transactions.
 *
 * Props:
 *   onSearch – async (query: string) => SearchResult[]
 *              where SearchResult = { blockIndex: number, transaction: string }
 */
export default function SearchPanel({ onSearch }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState(null);  // null = no search yet
  const [error, setError]     = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    setError('');
    try {
      const res = await onSearch(q);
      setResults(res);
    } catch (e) {
      setError(e.message);
      setResults(null);
    } finally {
      setSearching(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Panel icon="🔍" title="Search Blockchain">
      <label style={S.label}>Search Query</label>
      <div style={S.inputRow}>
        <input
          style={S.input}
          placeholder="Search transactions across all blocks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
        />
        <Button
          variant="search"
          onClick={handleSearch}
          disabled={searching || !query.trim()}
        >
          {searching ? '...' : 'SEARCH'}
        </Button>
      </div>

      {error && (
        <StatusMessage type="error">⚠ {error}</StatusMessage>
      )}

      {/* Results area — only shown after at least one search */}
      {results !== null && (
        <div style={S.results}>
          {results.length === 0 ? (
            <div style={S.empty}>No transactions found matching "{query}"</div>
          ) : (
            <>
              <div style={S.countLine}>
                {results.length} RESULT{results.length !== 1 ? 'S' : ''} FOUND
              </div>
              {results.map((r, i) => (
                <div key={i} style={S.resultCard}>
                  <div style={S.resultLabel}>Block #{r.blockIndex}</div>
                  <div style={S.resultTx}>{r.transaction}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </Panel>
  );
}