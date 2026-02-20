// blockchain/chain.go
// Chain manages the ordered list of blocks and the pending transaction pool.
// Every mutating operation (AddTransaction, MineBlock) automatically persists
// the full state to a JSON file via the injected *storage.Store.

package blockchain

import (
	"errors"
	"fmt"
	"strings"
	"sync"

	"abubakar-blockchain/storage"
)

// SearchResult holds a single matched transaction and the block it lives in.
type SearchResult struct {
	BlockIndex  int    `json:"blockIndex"`
	Transaction string `json:"transaction"`
}

// persistData is the JSON schema written to / read from disk.
// Separating it from Chain keeps the mutex out of the serialised output.
type persistData struct {
	Blocks  []*Block `json:"blocks"`
	Pending []string `json:"pending"`
}

// Chain manages the ordered list of blocks and a pending transaction pool.
// All public methods are safe for concurrent use.
type Chain struct {
	mu      sync.RWMutex
	blocks  []*Block
	pending []string
	store   *storage.Store // may be nil (no persistence)
}

// ── Constructors ──────────────────────────────────────────────────────────────

// New creates a Chain, attempting to load existing state from the store.
// If no saved data exists it mines the genesis block and saves immediately.
func New(store *storage.Store) *Chain {
	c := &Chain{store: store}

	if store != nil {
		if err := c.load(); err == nil {
			fmt.Printf("📂  Loaded blockchain from %s (%d blocks, %d pending)\n",
				store.Path(), len(c.blocks), len(c.pending))
			return c
		} else if !errors.Is(err, storage.ErrNotFound) {
			// File exists but is corrupt — log and start fresh.
			fmt.Printf("⚠   Could not load %s: %v — starting fresh.\n", store.Path(), err)
		}
	}

	// First run: mine genesis and persist.
	fmt.Print("⛏  No saved chain found. Mining genesis block (l22-6559)... ")
	c.blocks = append(c.blocks, CreateGenesis())
	c.pending = []string{}
	fmt.Printf("done! Hash: %s...\n", c.blocks[0].Hash[:16])
	c.save()
	return c
}

// ── Persistence helpers ───────────────────────────────────────────────────────

// load reads the JSON file and restores blocks + pending pool.
// Must be called without holding the mutex.
func (c *Chain) load() error {
	if c.store == nil {
		return storage.ErrNotFound
	}
	var d persistData
	if err := c.store.Load(&d); err != nil {
		return err
	}
	c.blocks = d.Blocks
	c.pending = d.Pending
	if c.pending == nil {
		c.pending = []string{}
	}
	return nil
}

// save writes the current state to the JSON file.
// Caller must hold at least a read lock (or the write lock for mutations).
func (c *Chain) save() {
	if c.store == nil {
		return
	}
	d := persistData{
		Blocks:  c.blocks,
		Pending: c.pending,
	}
	if err := c.store.Save(d); err != nil {
		fmt.Printf("⚠   Failed to save blockchain: %v\n", err)
	}
}

// ── Public API ────────────────────────────────────────────────────────────────

// AddTransaction appends a transaction string to the pending pool and saves.
func (c *Chain) AddTransaction(data string) error {
	if strings.TrimSpace(data) == "" {
		return errors.New("transaction data cannot be empty")
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	c.pending = append(c.pending, data)
	c.save()
	return nil
}

// MineBlock takes all pending transactions, builds and mines a new block,
// appends it to the chain, resets the pending pool, and saves.
// Returns an error when there are no pending transactions.
func (c *Chain) MineBlock() (*Block, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if len(c.pending) == 0 {
		return nil, errors.New("no pending transactions to mine")
	}

	prev := c.blocks[len(c.blocks)-1]

	txs := make([]string, len(c.pending))
	copy(txs, c.pending)

	block := NewBlock(prev.Index+1, txs, prev.Hash)
	block.Mine()

	c.blocks = append(c.blocks, block)
	c.pending = []string{}
	c.save()
	return block, nil
}

// GetChain returns a shallow copy of the block slice.
func (c *Chain) GetChain() []*Block {
	c.mu.RLock()
	defer c.mu.RUnlock()
	out := make([]*Block, len(c.blocks))
	copy(out, c.blocks)
	return out
}

// GetPending returns a copy of the current pending pool.
func (c *Chain) GetPending() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	out := make([]string, len(c.pending))
	copy(out, c.pending)
	return out
}

// Search does a case-insensitive substring search across every transaction
// in every block.
func (c *Chain) Search(query string) []SearchResult {
	c.mu.RLock()
	defer c.mu.RUnlock()

	q := strings.ToLower(query)
	var results []SearchResult
	for _, b := range c.blocks {
		for _, tx := range b.Transactions {
			if strings.Contains(strings.ToLower(tx), q) {
				results = append(results, SearchResult{
					BlockIndex:  b.Index,
					Transaction: tx,
				})
			}
		}
	}
	return results
}

// IsValid verifies hash linkage and PoW for every block in the chain.
func (c *Chain) IsValid() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()

	for i := 1; i < len(c.blocks); i++ {
		cur := c.blocks[i]
		prev := c.blocks[i-1]
		if !cur.IsValid() || cur.PrevHash != prev.Hash {
			return false
		}
	}
	return true
}
