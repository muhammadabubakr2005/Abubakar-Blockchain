package api

import (
	"net/http"

	"abubakar-blockchain/blockchain"
)

// Handler holds a reference to the blockchain and exposes HTTP handler methods
type Handler struct {
	Chain *blockchain.Chain
}

// NewHandler creates a Handler backed by the given Chain
func NewHandler(chain *blockchain.Chain) *Handler {
	return &Handler{Chain: chain}
}

// ─── GET /chain ──────────────────────────────────────────────────────────────

// GetChain returns the full blockchain
func (h *Handler) GetChain(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Error(w, http.StatusMethodNotAllowed, "GET only")
		return
	}
	blocks := h.Chain.GetChain()
	JSON(w, http.StatusOK, map[string]interface{}{
		"chain":  blocks,
		"length": len(blocks),
	})
}

// ─── POST /add-transaction ───────────────────────────────────────────────────

type addTxRequest struct {
	Data string `json:"data"`
}

// AddTransaction appends a transaction to the pending pool
func (h *Handler) AddTransaction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Error(w, http.StatusMethodNotAllowed, "POST only")
		return
	}
	var req addTxRequest
	if !DecodeBody(w, r, &req) {
		return
	}
	if err := h.Chain.AddTransaction(req.Data); err != nil {
		Error(w, http.StatusBadRequest, err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]interface{}{
		"message": "Transaction added to pending pool",
		"pending": h.Chain.GetPending(),
	})
}

// ─── POST /mine ──────────────────────────────────────────────────────────────

// MineBlock mines pending transactions into a new block
func (h *Handler) MineBlock(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Error(w, http.StatusMethodNotAllowed, "POST only")
		return
	}
	block, err := h.Chain.MineBlock()
	if err != nil {
		Error(w, http.StatusBadRequest, err.Error())
		return
	}
	JSON(w, http.StatusOK, block)
}

// ─── GET /search?q=... ───────────────────────────────────────────────────────

// Search finds transactions matching the query string across all blocks
func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Error(w, http.StatusMethodNotAllowed, "GET only")
		return
	}
	q := r.URL.Query().Get("q")
	if q == "" {
		Error(w, http.StatusBadRequest, "query param 'q' is required")
		return
	}
	results := h.Chain.Search(q)
	JSON(w, http.StatusOK, map[string]interface{}{
		"query":   q,
		"results": results,
	})
}

// ─── GET /pending ────────────────────────────────────────────────────────────

// GetPending returns the current pending transaction pool
func (h *Handler) GetPending(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Error(w, http.StatusMethodNotAllowed, "GET only")
		return
	}
	JSON(w, http.StatusOK, map[string]interface{}{
		"pending": h.Chain.GetPending(),
	})
}

// ─── GET /validate ───────────────────────────────────────────────────────────

// ValidateChain reports whether the entire chain is cryptographically valid
func (h *Handler) ValidateChain(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Error(w, http.StatusMethodNotAllowed, "GET only")
		return
	}
	valid := h.Chain.IsValid()
	JSON(w, http.StatusOK, map[string]interface{}{
		"valid":   valid,
		"message": map[bool]string{true: "Chain integrity verified", false: "Chain is INVALID"}[valid],
	})
}
