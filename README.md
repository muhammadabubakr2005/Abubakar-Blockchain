# ⛓ Abubakar Blockchain

A full-stack blockchain implementation built with a **Go** backend and a **React** frontend. The system implements core blockchain concepts including Proof of Work mining, Merkle tree transaction hashing, JSON-based persistence, and a cyberpunk-styled browser UI.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
- [Backend Documentation](#backend-documentation)
  - [Packages](#packages)
  - [API Endpoints](#api-endpoints)
  - [Blockchain Data Model](#blockchain-data-model)
  - [Persistence](#persistence)
- [Frontend Documentation](#frontend-documentation)
  - [Components](#components)
  - [Custom Hook](#custom-hook)
  - [API Client](#api-client)
- [How It Works](#how-it-works)
  - [Genesis Block](#genesis-block)
  - [Adding Transactions](#adding-transactions)
  - [Proof of Work Mining](#proof-of-work-mining)
  - [Merkle Tree](#merkle-tree)
  - [JSON Persistence](#json-persistence)
- [Configuration](#configuration)

---

## Overview

The **Abubakar Blockchain** is a demonstration project showing how a blockchain works end-to-end. The Go server maintains the chain state in memory and persists it to a local JSON file. The React UI lets you broadcast transactions, mine blocks, explore the full chain, and search through all recorded transactions — all without refreshing the page.

The first transaction ever recorded in the genesis block is the roll number **l22-6559**.

---

## Features

| Feature | Description |
|---|---|
| **Genesis Block** | Auto-mined on first run with roll number `l22-6559` as the seed transaction |
| **Merkle Tree** | Each block's transactions are hashed into a Merkle root for tamper detection |
| **Proof of Work** | SHA-256 mining requires a hash with 3 leading zeros (difficulty 3) |
| **Pending Pool** | Transactions are broadcast to a mempool before being mined into a block |
| **JSON Persistence** | Full chain state (blocks + pending) is saved to disk after every change |
| **Blockchain Explorer** | View all blocks with expandable detail cards showing every field |
| **Transaction Search** | Case-insensitive substring search across all transactions in all blocks |
| **Chain Validation** | Server-side endpoint to verify hash linkage and PoW integrity |
| **CORS Support** | Backend serves cross-origin requests so the React dev server works out of the box |
| **Concurrency Safe** | All chain operations are protected with `sync.RWMutex` |

---

## Tech Stack

**Backend**
- Go 1.22
- Standard library only — no external dependencies
- Packages: `net/http`, `crypto/sha256`, `encoding/json`, `sync`, `os`

**Frontend**
- React 18
- Create React App
- Inline styles + CSS variables (no UI library)
- Google Fonts: Orbitron, Rajdhani, Share Tech Mono

---

## Project Structure

```
abubakar-blockchain/
│
├── backend/                        Go HTTP server
│   ├── main.go                     Entry point — wires storage, chain, and router
│   ├── go.mod                      Module: abubakar/blockchain
│   │
│   ├── storage/
│   │   └── storage.go              JSON file persistence (atomic save + load)
│   │
│   ├── merkle/
│   │   └── merkle.go               Merkle tree construction from transaction strings
│   │
│   ├── blockchain/
│   │   ├── block.go                Block struct, ComputeHash, Mine (PoW), CreateGenesis
│   │   └── chain.go                Chain struct, AddTransaction, MineBlock, Search, IsValid
│   │
│   └── api/
│       ├── middleware.go           CORS wrapper, JSON helper, request body decoder
│       ├── handlers.go             One method per HTTP endpoint
│       └── router.go               Route registration on http.ServeMux
│
└── frontend/                       React application
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js                React entry point
        ├── index.css               CSS variables, keyframe animations, global reset
        ├── App.jsx                 Root component — composes all panels
        │
        ├── api/
        │   └── client.js           All fetch calls to the Go API (single source of truth)
        │
        ├── hooks/
        │   └── useBlockchain.js    Custom hook — all state, polling, and API wiring
        │
        └── components/
            ├── Header.jsx          Title bar with live stats (blocks, txs, difficulty, pending)
            ├── Panel.jsx           Reusable card shell with accent line and header slot
            ├── Button.jsx          Variant-driven button (primary / mine / search / danger)
            ├── StatusMessage.jsx   Inline success / error / info feedback bar
            ├── MiningOverlay.jsx   Full-screen animation shown while PoW runs
            ├── AddTransaction.jsx  Transaction input form + live mempool list
            ├── MineBlock.jsx       Mine button with PoW description and status
            ├── BlockCard.jsx       Collapsible card showing all fields of a single block
            ├── BlockExplorer.jsx   Full chain viewer — all blocks newest-first
            └── SearchPanel.jsx     Search input with per-block result cards
```

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Go | 1.22+ | Backend server |
| Node.js | 16+ | Frontend tooling |
| npm | 8+ | Frontend package manager |

### Running the Backend

```bash
cd backend

# First run — mines genesis block and creates blockchain.json
go run .

# Or build first
go build -o blockchain-server .
./blockchain-server
```

The server starts on **http://localhost:8080** and prints:

```
╔══════════════════════════════════════╗
║      ABUBAKAR BLOCKCHAIN SERVER      ║
╚══════════════════════════════════════╝

💾  Persistence file : blockchain.json

⛏  No saved chain found. Mining genesis block (l22-6559)... done!

🚀  Listening on http://localhost:8080
```

On subsequent runs it loads from the saved file instead:

```
📂  Loaded blockchain from blockchain.json (3 blocks, 0 pending)
```

### Running the Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm start
```

The React app opens at **http://localhost:3000** and connects automatically to the Go server via the `"proxy"` setting in `package.json`.

---

## Backend Documentation

### Packages

#### `storage`
Handles reading and writing the blockchain state to a JSON file.

| Function | Description |
|---|---|
| `New(path)` | Returns a Store for the given file path. Defaults to `blockchain.json` |
| `Save(v)` | Marshals v to indented JSON using an atomic write (temp → rename) |
| `Load(v)` | Reads and unmarshals the JSON file into v. Returns `ErrNotFound` if file is missing |

The atomic save pattern (write to temp file, then rename) ensures a server crash mid-write never produces a corrupt file.

#### `merkle`
Builds a binary Merkle tree from a slice of transaction strings.

| Function | Description |
|---|---|
| `BuildTree(transactions)` | Returns the root hash string. Returns `""` for empty input |

Each leaf node is the SHA-256 hash of one transaction string. Internal nodes combine their children's hashes and SHA-256 the result. If the number of nodes at any level is odd, the last node is duplicated.

#### `blockchain`

**`block.go`**

| Item | Description |
|---|---|
| `Block` struct | `Index`, `Timestamp`, `Transactions`, `MerkleRoot`, `PrevHash`, `Hash`, `Nonce`, `Difficulty` |
| `NewBlock(index, txs, prevHash)` | Creates an unmined block with a Merkle root computed from txs |
| `ComputeHash()` | SHA-256 of `index + timestamp + merkleRoot + prevHash + nonce` |
| `Mine()` | Increments Nonce until Hash has `Difficulty` leading zeros |
| `IsValid()` | Returns true if stored Hash matches a fresh computation and satisfies PoW |
| `CreateGenesis()` | Builds and mines block #0 with transaction `l22-6559` |

**`chain.go`**

| Method | Description |
|---|---|
| `New(store)` | Loads chain from file if it exists, otherwise mines genesis and saves |
| `AddTransaction(data)` | Appends to pending pool and saves to disk |
| `MineBlock()` | Mines all pending txs into a new block, clears pool, saves to disk |
| `GetChain()` | Returns a thread-safe copy of all blocks |
| `GetPending()` | Returns a thread-safe copy of the pending pool |
| `Search(query)` | Case-insensitive substring search across all block transactions |
| `IsValid()` | Verifies hash linkage and PoW for every block in sequence |

#### `api`

**`middleware.go`** — shared HTTP utilities: `CORS()` wrapper, `JSON()` writer, `Error()` writer, `DecodeBody()` decoder.

**`handlers.go`** — one method per endpoint, each bound to a `*blockchain.Chain`.

**`router.go`** — registers all routes on an `http.ServeMux` and returns it.

---

### API Endpoints

All endpoints accept and return JSON. CORS is enabled for all origins.

| Method | Path | Description |
|---|---|---|
| `GET` | `/chain` | Returns `{ chain: Block[], length: number }` |
| `POST` | `/add-transaction` | Body: `{ "data": "string" }`. Adds tx to pending pool |
| `POST` | `/mine` | Mines all pending txs into a new block. Returns the new `Block` |
| `GET` | `/search?q=<query>` | Returns `{ query, results: [{ blockIndex, transaction }] }` |
| `GET` | `/pending` | Returns `{ pending: string[] }` |
| `GET` | `/validate` | Returns `{ valid: bool, message: string }` |
| `GET` | `/health` | Returns `{ status: "ok", name: "Abubakar Blockchain" }` |

#### Example: Add a transaction

```bash
curl -X POST http://localhost:8080/add-transaction \
  -H "Content-Type: application/json" \
  -d '{"data": "Alice sends 10 BTC to Bob"}'
```

#### Example: Mine a block

```bash
curl -X POST http://localhost:8080/mine
```

#### Example: Search

```bash
curl "http://localhost:8080/search?q=alice"
```

---

### Blockchain Data Model

Each block serialises to the following JSON shape:

```json
{
  "index": 1,
  "timestamp": "2026-02-20T10:11:40Z",
  "transactions": [
    "Alice sends 10 BTC to Bob"
  ],
  "merkleRoot": "35f5814fa4c09c39012f1e168a2c94b58fae3000126e158bd0592ff6f5943187",
  "prevHash": "000121e01c257f1189d6dac04001df7f3e1cbc7a019aadd463d23a50cc1e96c8",
  "hash": "000ba910195e2fb2281aef11e551c4f3099aa52f1e8cdc0e7e9f19176ccdc073",
  "nonce": 3455,
  "difficulty": 3
}
```

The full persistence file (`blockchain.json`) wraps blocks and pending pool:

```json
{
  "blocks": [ ...Block[] ],
  "pending": [ ...string[] ]
}
```

---

### Persistence

The chain is saved to `blockchain.json` in the directory where the server runs. This happens automatically after:
- Genesis block is mined (first run)
- A transaction is added to the pending pool
- A block is successfully mined

On startup, the server attempts to load the file. If it does not exist, genesis is mined and the file is created. If the file exists but is corrupt, the server logs a warning and starts fresh.

To use a custom file path:

```bash
./blockchain-server -db /path/to/mychain.json
```

---

## Frontend Documentation

### Components

| Component | File | Description |
|---|---|---|
| `Header` | `Header.jsx` | Displays the blockchain name, connection status, and four live stat counters (blocks, transactions, difficulty, pending) |
| `Panel` | `Panel.jsx` | Reusable card wrapper used by every feature section. Accepts `icon`, `title`, `headerExtra`, and `fullWidth` props |
| `Button` | `Button.jsx` | Styled button with four variants: `primary` (cyan), `mine` (purple), `search` (green), `danger` (red) |
| `StatusMessage` | `StatusMessage.jsx` | Inline feedback bar. Types: `success`, `error`, `info`. Returns null when empty so no conditional needed at call site |
| `MiningOverlay` | `MiningOverlay.jsx` | Fixed full-screen overlay with spinner and pulsing text, shown while the backend mines |
| `AddTransaction` | `AddTransaction.jsx` | Textarea form to compose and broadcast a transaction. Shows the live mempool list below the form. Supports Ctrl+Enter shortcut |
| `MineBlock` | `MineBlock.jsx` | Mine button with PoW description, pending count badges, and post-mine status message |
| `BlockCard` | `BlockCard.jsx` | Collapsible block card. Header row shows index badge and hash preview. Expanded view shows all 8 fields with a scrollable inner container |
| `BlockExplorer` | `BlockExplorer.jsx` | Lists all blocks newest-first with chain-link connectors between cards. Page scrolls naturally when multiple blocks are open |
| `SearchPanel` | `SearchPanel.jsx` | Search input (Enter key supported) with a result list showing matched transaction text and block index |

### Custom Hook

**`useBlockchain.js`** is the single source of state for the entire app. It is consumed only by `App.jsx` and its return values are passed as props to each panel.

| Returned Value | Type | Description |
|---|---|---|
| `chain` | `Block[]` | Current blockchain |
| `pending` | `string[]` | Pending transaction pool |
| `stats` | `object` | `{ blocks, transactions, difficulty, pending }` |
| `loading` | `boolean` | True while an add-transaction request is in-flight |
| `mining` | `boolean` | True while a mine request is in-flight |
| `connected` | `boolean` | False if the backend cannot be reached |
| `refresh()` | `async fn` | Re-fetches chain and pending from the server |
| `addTransaction(data)` | `async fn` | Broadcasts a transaction. Returns `{ success, message }` |
| `mine()` | `async fn` | Triggers mining. Returns `{ success, block? }` or `{ success, message }` |
| `search(q)` | `async fn` | Searches the chain. Returns `SearchResult[]` |

The hook polls the pending pool every 5 seconds automatically.

### API Client

**`src/api/client.js`** contains all six `fetch` calls in one place. Every component accesses the backend exclusively through the hook, never directly through this file.

| Export | Maps to |
|---|---|
| `getChain()` | `GET /chain` |
| `getPending()` | `GET /pending` |
| `addTransaction(data)` | `POST /add-transaction` |
| `mineBlock()` | `POST /mine` |
| `searchChain(q)` | `GET /search?q=` |
| `validateChain()` | `GET /validate` |

---

## How It Works

### Genesis Block

On first run, the server creates block #0 with a single transaction: `l22-6559` (the roll number). It mines this block using Proof of Work before accepting any connections. The result is saved to `blockchain.json` immediately.

### Adding Transactions

Transactions are plain strings. When a transaction is broadcast via `POST /add-transaction`, it is appended to the in-memory pending pool and the updated state is written to disk. Transactions stay in the pool until a block is mined.

### Proof of Work Mining

When `POST /mine` is called, the server:
1. Takes all pending transactions from the pool
2. Builds a Merkle tree from them and records the root hash
3. Creates a new block with `prevHash` set to the last block's hash
4. Increments `Nonce` repeatedly, recomputing the SHA-256 hash each time
5. Stops when the hash begins with `000` (3 leading zeros = difficulty 3)
6. Appends the block to the chain, clears the pending pool, and saves to disk

### Merkle Tree

Given transactions `[T1, T2, T3, T4]`:

```
        Root
       /    \
    H(12)  H(34)
    /  \   /  \
  H1  H2 H3  H4
  T1  T2 T3  T4
```

Each `Hn` = SHA-256 of the transaction string. Each internal node = SHA-256 of `left.Hash + right.Hash`. If the count at any level is odd, the last node is duplicated. The root hash is stored in the block and changes if any transaction is altered — providing tamper evidence.

### JSON Persistence

The `storage.Store` uses an **atomic write** pattern:

```
1. Marshal state to JSON bytes
2. Write bytes to a temp file (e.g. blockchain-123456.tmp)
3. os.Rename(tempFile, targetFile)   ← atomic on most systems
```

Step 3 is atomic on Linux and macOS, meaning the target file is either the old version or the new version — never a partial write. This protects the saved data against server crashes.

---

## Configuration

| Setting | Default | How to Change |
|---|---|---|
| Persistence file path | `blockchain.json` | Run with `-db /path/to/file.json` |
| Server port | `:8080` | Edit `const port` in `main.go` |
| Mining difficulty | `3` | Edit `const Difficulty` in `blockchain/block.go` |
| Frontend API base URL | `http://localhost:8080` | Edit `const BASE` in `src/api/client.js` |
| Pending pool poll interval | 5 seconds | Edit `setInterval` in `src/hooks/useBlockchain.js` |