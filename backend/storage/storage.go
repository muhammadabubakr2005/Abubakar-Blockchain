// storage/storage.go
// Handles reading and writing the blockchain state to a JSON file on disk.
// The file stores both the mined blocks and the pending transaction pool so
// that nothing is lost between server restarts.

package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

const defaultFile = "blockchain.json"

// Store manages persistence for any JSON-serialisable value.
type Store struct {
	path string // absolute or relative path to the JSON file
}

// New returns a Store backed by the given file path.
// If path is empty, "blockchain.json" in the current working directory is used.
func New(path string) *Store {
	if path == "" {
		path = defaultFile
	}
	return &Store{path: path}
}

// Path returns the file path used by this store.
func (s *Store) Path() string { return s.path }

// Save serialises v as indented JSON and writes it atomically:
//  1. Write to a temp file next to the target.
//  2. Rename (atomic on most OS / file systems) to the target path.
//
// This prevents a partial write from corrupting the saved state.
func (s *Store) Save(v interface{}) error {
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return fmt.Errorf("storage: marshal: %w", err)
	}

	// Write to a sibling temp file first.
	dir := filepath.Dir(s.path)
	tmp, err := os.CreateTemp(dir, "blockchain-*.tmp")
	if err != nil {
		return fmt.Errorf("storage: create temp: %w", err)
	}
	tmpName := tmp.Name()

	if _, err = tmp.Write(data); err != nil {
		tmp.Close()
		os.Remove(tmpName)
		return fmt.Errorf("storage: write temp: %w", err)
	}
	if err = tmp.Close(); err != nil {
		os.Remove(tmpName)
		return fmt.Errorf("storage: close temp: %w", err)
	}

	// Atomic rename.
	if err = os.Rename(tmpName, s.path); err != nil {
		os.Remove(tmpName)
		return fmt.Errorf("storage: rename: %w", err)
	}
	return nil
}

// Load reads the JSON file and unmarshals it into v.
// Returns ErrNotFound if the file does not exist yet (first run).
func (s *Store) Load(v interface{}) error {
	data, err := os.ReadFile(s.path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return ErrNotFound
		}
		return fmt.Errorf("storage: read: %w", err)
	}
	if err = json.Unmarshal(data, v); err != nil {
		return fmt.Errorf("storage: unmarshal: %w", err)
	}
	return nil
}

// ErrNotFound is returned by Load when the backing file does not exist.
var ErrNotFound = errors.New("storage: file not found")
