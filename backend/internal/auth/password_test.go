package auth

import (
	"errors"
	"strings"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

// benchmarkCost é o custo de produção, para o benchmark medir o custo real.
const benchmarkCost = 12

func TestHashThenCompare(t *testing.T) {
	hasher := NewHasher(bcrypt.MinCost)

	hash, err := hasher.Hash("senha-segura")
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(hash, "senha-segura") {
		t.Fatal("o hash não pode conter a senha")
	}
	if err := hasher.Compare(hash, "senha-segura"); err != nil {
		t.Fatalf("senha correta recusada: %v", err)
	}
	if err := hasher.Compare(hash, "senha-errada"); !errors.Is(err, ErrPasswordMismatch) {
		t.Fatalf("erro = %v, queria ErrPasswordMismatch", err)
	}
}

func TestHashUsesConfiguredCost(t *testing.T) {
	hash, err := NewHasher(5).Hash("senha-segura")
	if err != nil {
		t.Fatal(err)
	}
	cost, err := bcrypt.Cost([]byte(hash))
	if err != nil || cost != 5 {
		t.Fatalf("cost = %d, err = %v", cost, err)
	}
}

func TestCompareRejectsPasswordBeyondBcryptLimit(t *testing.T) {
	hasher := NewHasher(bcrypt.MinCost)
	base := strings.Repeat("a", MaxPasswordBytes)
	hash, err := hasher.Hash(base)
	if err != nil {
		t.Fatal(err)
	}
	// O bcrypt só olha os 72 primeiros bytes; o excedente não pode autenticar.
	if err := hasher.Compare(hash, base+"extra"); !errors.Is(err, ErrPasswordMismatch) {
		t.Fatalf("erro = %v, queria ErrPasswordMismatch", err)
	}
}

func TestCompareReportsCorruptHash(t *testing.T) {
	err := NewHasher(bcrypt.MinCost).Compare("nao-e-bcrypt", "senha-segura")
	if err == nil || errors.Is(err, ErrPasswordMismatch) {
		t.Fatalf("hash corrompido não é senha errada: %v", err)
	}
}

func TestCompareDummyDoesNotPanic(t *testing.T) {
	NewHasher(bcrypt.MinCost).CompareDummy("qualquer")
}

func BenchmarkPasswordHash(b *testing.B) {
	hasher := NewHasher(benchmarkCost)
	b.ReportAllocs()
	for b.Loop() {
		if _, err := hasher.Hash("senha-segura"); err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkPasswordCompare(b *testing.B) {
	hasher := NewHasher(benchmarkCost)
	hash, err := hasher.Hash("senha-segura")
	if err != nil {
		b.Fatal(err)
	}
	b.ReportAllocs()
	for b.Loop() {
		if err := hasher.Compare(hash, "senha-segura"); err != nil {
			b.Fatal(err)
		}
	}
}
