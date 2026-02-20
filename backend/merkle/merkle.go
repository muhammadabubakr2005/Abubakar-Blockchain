package merkle

import (
	"crypto/sha256"
	"encoding/hex"
)

// Node represents a single node in the Merkle tree
type Node struct {
	Left  *Node
	Right *Node
	Hash  string
}

// NewLeafNode creates a leaf node by hashing the given data
func NewLeafNode(data string) *Node {
	h := sha256.Sum256([]byte(data))
	return &Node{Hash: hex.EncodeToString(h[:])}
}

// NewInternalNode creates an internal node by combining left and right hashes
func NewInternalNode(left, right *Node) *Node {
	combined := left.Hash + right.Hash
	h := sha256.Sum256([]byte(combined))
	return &Node{
		Left:  left,
		Right: right,
		Hash:  hex.EncodeToString(h[:]),
	}
}

// BuildTree constructs a Merkle tree from a list of transaction strings
// and returns the root hash. Returns empty string if no transactions.
func BuildTree(transactions []string) string {
	if len(transactions) == 0 {
		return ""
	}

	// Build leaf layer
	nodes := make([]*Node, len(transactions))
	for i, tx := range transactions {
		nodes[i] = NewLeafNode(tx)
	}

	// Reduce until we have a single root
	for len(nodes) > 1 {
		// Duplicate last node if odd count
		if len(nodes)%2 != 0 {
			nodes = append(nodes, nodes[len(nodes)-1])
		}
		var level []*Node
		for i := 0; i < len(nodes); i += 2 {
			level = append(level, NewInternalNode(nodes[i], nodes[i+1]))
		}
		nodes = level
	}

	return nodes[0].Hash
}
