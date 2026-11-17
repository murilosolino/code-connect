// Package auth reúne as regras de autenticação: tokens, senhas, identidade e validação.
package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// CookieName é o cookie que carrega o JWT da sessão.
const CookieName = "cc_session"

const (
	tokenIssuer  = "code-connect"
	tokenIDBytes = 16
)

// ErrInvalidToken cobre todo token recusado, sem revelar o motivo a quem chama.
var ErrInvalidToken = errors.New("token inválido")

// Claims são os dados da sessão extraídos de um token.
type Claims struct {
	UserID    int64
	JTI       string
	ExpiresAt time.Time
}

// TokenManager emite e verifica JWTs HS256.
type TokenManager struct {
	secret []byte
	// Now existe para os testes controlarem o relógio.
	Now func() time.Time
}

func NewTokenManager(secret string) *TokenManager {
	return &TokenManager{secret: []byte(secret), Now: time.Now}
}

// Issue emite um token para o usuário, válido por ttl.
func (m *TokenManager) Issue(userID int64, ttl time.Duration) (string, Claims, error) {
	id := make([]byte, tokenIDBytes)
	if _, err := rand.Read(id); err != nil {
		return "", Claims{}, fmt.Errorf("gerar jti: %w", err)
	}

	now := m.Now().UTC()
	registered := jwt.RegisteredClaims{
		Issuer:    tokenIssuer,
		Subject:   strconv.FormatInt(userID, 10),
		ID:        hex.EncodeToString(id),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, registered).SignedString(m.secret)
	if err != nil {
		return "", Claims{}, fmt.Errorf("assinar token: %w", err)
	}
	return token, Claims{UserID: userID, JTI: registered.ID, ExpiresAt: registered.ExpiresAt.Time}, nil
}

// Verify valida assinatura, algoritmo, emissor e expiração. Todo erro envolve ErrInvalidToken.
func (m *TokenManager) Verify(token string) (Claims, error) {
	parser := jwt.NewParser(
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
		jwt.WithIssuer(tokenIssuer),
		jwt.WithExpirationRequired(),
		jwt.WithTimeFunc(m.Now),
	)

	registered := &jwt.RegisteredClaims{}
	if _, err := parser.ParseWithClaims(token, registered, func(*jwt.Token) (any, error) {
		return m.secret, nil
	}); err != nil {
		return Claims{}, fmt.Errorf("%w: %v", ErrInvalidToken, err)
	}

	userID, err := strconv.ParseInt(registered.Subject, 10, 64)
	if err != nil || userID <= 0 {
		return Claims{}, fmt.Errorf("%w: subject inválido", ErrInvalidToken)
	}
	if registered.ID == "" {
		return Claims{}, fmt.Errorf("%w: sem jti", ErrInvalidToken)
	}
	return Claims{UserID: userID, JTI: registered.ID, ExpiresAt: registered.ExpiresAt.Time}, nil
}
