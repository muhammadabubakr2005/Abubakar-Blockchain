package blockchain

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"

	"abubakar-blockchain/merkle"
)

const Difficulty = 3

// Block represents a single block in the Abubakar blockchain
type Block struct {
	Index        int      `json:"index"`
	Timestamp    string   `json:"timestamp"`
	Transactions []string `json:"transactions"`
	MerkleRoot   string   `json:"merkleRoot"`
	PrevHash     string   `json:"prevHash"`
	Hash         string   `json:"hash"`
	Nonce        int      `json:"nonce"`
	Difficulty   int      `json:"difficulty"`
}

// NewBlock creates a new unmined block
func NewBlock(index int, transactions []string, prevHash string) *Block {
	return &Block{
		Index:        index,
		Timestamp:    time.Now().UTC().Format(time.RFC3339),
		Transactions: transactions,
		MerkleRoot:   merkle.BuildTree(transactions),
		PrevHash:     prevHash,
		Difficulty:   Difficulty,
	}
}

// ComputeHash calculates the SHA-256 hash of the block's contents
func (b *Block) ComputeHash() string {
	record := fmt.Sprintf("%d%s%s%s%d", b.Index, b.Timestamp, b.MerkleRoot, b.PrevHash, b.Nonce)
	h := sha256.Sum256([]byte(record))
	return hex.EncodeToString(h[:])
}

// Mine performs Proof-of-Work: increments Nonce until Hash satisfies Difficulty
func (b *Block) Mine() {
	prefix := strings.Repeat("0", b.Difficulty)
	for {
		b.Hash = b.ComputeHash()
		if strings.HasPrefix(b.Hash, prefix) {
			break
		}
		b.Nonce++
	}
}

// IsValid checks that the block's stored hash matches a fresh computation
func (b *Block) IsValid() bool {
	return b.Hash == b.ComputeHash() &&
		strings.HasPrefix(b.Hash, strings.Repeat("0", b.Difficulty))
}

// genesisHash is the sentinel prev-hash used for the genesis block
var genesisHash = strings.Repeat("0", 64)

// CreateGenesis builds and mines the genesis block with the first transaction
func CreateGenesis() *Block {
	transactions := []string{"l22-6559"} // Roll number as first transaction
	b := NewBlock(0, transactions, genesisHash)
	b.Mine()
	return b
}

// hashString helper (re-exported for handlers if needed)
func hashString(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}

// unused but keeps the import
var _ = strconv.Itoa
