package api

import (
	"fmt"
	"net/http"

	"abubakar-blockchain/blockchain"
)

// NewRouter creates a configured http.ServeMux with all blockchain routes registered
func NewRouter(chain *blockchain.Chain) *http.ServeMux {
	h := NewHandler(chain)
	mux := http.NewServeMux()

	mux.HandleFunc("/chain", CORS(h.GetChain))
	mux.HandleFunc("/add-transaction", CORS(h.AddTransaction))
	mux.HandleFunc("/mine", CORS(h.MineBlock))
	mux.HandleFunc("/search", CORS(h.Search))
	mux.HandleFunc("/pending", CORS(h.GetPending))
	mux.HandleFunc("/validate", CORS(h.ValidateChain))

	// Health check
	mux.HandleFunc("/health", CORS(func(w http.ResponseWriter, r *http.Request) {
		JSON(w, http.StatusOK, map[string]string{"status": "ok", "name": "Abubakar Blockchain"})
	}))

	fmt.Println("Routes registered:")
	fmt.Println("  GET  /chain")
	fmt.Println("  POST /add-transaction")
	fmt.Println("  POST /mine")
	fmt.Println("  GET  /search?q=<query>")
	fmt.Println("  GET  /pending")
	fmt.Println("  GET  /validate")
	fmt.Println("  GET  /health")

	return mux
}
