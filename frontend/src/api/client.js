// src/api/client.js
// Single source of truth for all HTTP calls to the Go backend.

const BASE = 'http://localhost:8080';

async function request(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(BASE + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
  return data;
}

/** Fetch the full blockchain. */
export const getChain = () => request('/chain');

/** Fetch the pending transaction pool. */
export const getPending = () => request('/pending');

/** Add a transaction string to the pending pool. */
export const addTransaction = (data) =>
  request('/add-transaction', 'POST', { data });

/** Mine all pending transactions into a new block. */
export const mineBlock = () => request('/mine', 'POST');

/** Search all blocks for transactions containing query (case-insensitive). */
export const searchChain = (q) =>
  request(`/search?q=${encodeURIComponent(q)}`);

/** Verify the integrity of the entire chain. */
export const validateChain = () => request('/validate');