package auth

import (
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// ErrPasswordMismatch indica senha incorreta (e não falha ao comparar).
var ErrPasswordMismatch = errors.New("senha incorreta")

// Hasher gera e compara hashes bcrypt.
type Hasher struct {
	cost  int
	dummy []byte
}

// NewHasher prepara o hash fictício usado em CompareDummy. Custo inválido é erro de
// programação: config.Validate já o recusa antes de a API subir.
func NewHasher(cost int) *Hasher {
	dummy, err := bcrypt.GenerateFromPassword([]byte("hash-ficticio-para-tempo-constante"), cost)
	if err != nil {
		panic(fmt.Sprintf("custo de bcrypt inválido (%d): %v", cost, err))
	}
	return &Hasher{cost: cost, dummy: dummy}
}

func (h *Hasher) Hash(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), h.cost)
	if err != nil {
		return "", fmt.Errorf("gerar hash: %w", err)
	}
	return string(hash), nil
}

// Compare devolve ErrPasswordMismatch para senha errada. O bcrypt só considera os 72 primeiros
// bytes, então senhas maiores são recusadas mesmo que esse início confira.
func (h *Hasher) Compare(hash, password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	switch {
	case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword), errors.Is(err, bcrypt.ErrPasswordTooLong):
		return ErrPasswordMismatch
	case err != nil:
		return fmt.Errorf("comparar hash: %w", err)
	case len(password) > MaxPasswordBytes:
		return ErrPasswordMismatch
	}
	return nil
}

// CompareDummy gasta o mesmo tempo de Compare quando o usuário não existe, para o tempo de
// resposta não revelar quais contas estão cadastradas.
func (h *Hasher) CompareDummy(password string) {
	_ = bcrypt.CompareHashAndPassword(h.dummy, []byte(password))
}
