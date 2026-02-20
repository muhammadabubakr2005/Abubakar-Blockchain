package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"abubakar-blockchain/api"
	"abubakar-blockchain/blockchain"
	"abubakar-blockchain/storage"
)

const port = ":8080"

func main() {
	// Optional -db flag lets the user override the default file path.
	dbPath := flag.String("db", "blockchain.json", "path to the JSON persistence file")
	flag.Parse()

	fmt.Println("╔══════════════════════════════════════╗")
	fmt.Println("║      ABUBAKAR BLOCKCHAIN SERVER      ║")
	fmt.Println("╚══════════════════════════════════════╝")
	fmt.Println()
	fmt.Printf("💾  Persistence file : %s\n\n", *dbPath)

	// Initialise storage.
	store := storage.New(*dbPath)

	// Initialise chain — loads from file if it exists, otherwise mines genesis.
	chain := blockchain.New(store)

	// Register routes.
	router := api.NewRouter(chain)
	fmt.Printf("\n🚀  Listening on http://localhost%s\n", port)

	log.Fatal(http.ListenAndServe(port, router))
}
