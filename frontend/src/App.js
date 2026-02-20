// src/App.jsx
import React from 'react';
import { useBlockchain } from './hooks/useBlockchain';
import Header        from './components/Header';
import AddTransaction from './components/AddTransaction';
import MineBlock     from './components/MineBlock';
import SearchPanel   from './components/SearchPanel';
import BlockExplorer from './components/BlockExplorer';
import MiningOverlay from './components/MiningOverlay';

const S = {
  main: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
};

export default function App() {
  const bc = useBlockchain();

  return (
    <>
      {/* Full-screen overlay while PoW is running */}
      <MiningOverlay active={bc.mining} />

      {/* Site header with live stats */}
      <Header stats={bc.stats} connected={bc.connected} />

      {/* Two-column panel grid */}
      <main style={S.main} className="bc-grid">
        <AddTransaction
          pending={bc.pending}
          onAdd={bc.addTransaction}
          loading={bc.loading}
        />
        <MineBlock
          pending={bc.pending}
          onMine={bc.mine}
          mining={bc.mining}
        />
        <SearchPanel onSearch={bc.search} />
        {/* BlockExplorer spans both columns via fullWidth prop */}
        <BlockExplorer chain={bc.chain} onRefresh={bc.refresh} />
      </main>

      {/* Responsive breakpoint — single column on narrow screens */}
      <style>{`
        @media (max-width: 768px) {
          .bc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}