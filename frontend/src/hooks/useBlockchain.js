// src/hooks/useBlockchain.js
// Central state manager — all API calls and derived data live here.

import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/client';

export function useBlockchain() {
  const [chain,     setChain]     = useState([]);
  const [pending,   setPending]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [mining,    setMining]    = useState(false);
  const [connected, setConnected] = useState(true);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const loadChain = useCallback(async () => {
    try {
      const data = await api.getChain();
      setChain(data.chain || []);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  const loadPending = useCallback(async () => {
    try {
      const data = await api.getPending();
      setPending(data.pending || []);
    } catch {
      // Silently ignore — connection errors are surfaced via loadChain
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadChain(), loadPending()]);
  }, [loadChain, loadPending]);

  // Poll pending pool every 5 s and do a full refresh on mount
  useEffect(() => {
    refresh();
    const id = setInterval(loadPending, 5000);
    return () => clearInterval(id);
  }, [refresh, loadPending]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addTransaction = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await api.addTransaction(data);
      setPending(res.pending || []);
      return { success: true, message: 'Transaction broadcast to mempool' };
    } catch (e) {
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const mine = useCallback(async () => {
    setMining(true);
    try {
      const block = await api.mineBlock();
      await refresh();
      return { success: true, block };
    } catch (e) {
      return { success: false, message: e.message };
    } finally {
      setMining(false);
    }
  }, [refresh]);

  const search = useCallback(async (q) => {
    const data = await api.searchChain(q);
    return data.results || [];
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const stats = {
    blocks:       chain.length,
    transactions: chain.reduce((acc, b) => acc + b.transactions.length, 0),
    difficulty:   chain.length > 0 ? chain[chain.length - 1].difficulty : 3,
    pending:      pending.length,
  };

  return {
    chain,
    pending,
    stats,
    loading,
    mining,
    connected,
    refresh,
    addTransaction,
    mine,
    search,
  };
}