package auth

import (
	"errors"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const testSecret = "0123456789abcdef0123456789abcdef"

var fixedNow = time.Date(2026, 11, 10, 12, 0, 0, 0, time.UTC)

func newTestManager() *TokenManager {
	manager := NewTokenManager(testSecret)
	manager.Now = func() time.Time { return fixedNow }
	return manager
}

func signClaims(t *testing.T, method jwt.SigningMethod, key any, claims jwt.RegisteredClaims) string {
	t.Helper()
	token, err := jwt.NewWithClaims(method, claims).SignedString(key)
	if err != nil {
		t.Fatal(err)
	}
	return token
}

func validClaims() jwt.RegisteredClaims {
	return jwt.RegisteredClaims{
		Issuer:    tokenIssuer,
		Subject:   "7",
		ID:        "abc",
		IssuedAt:  jwt.NewNumericDate(fixedNow),
		ExpiresAt: jwt.NewNumericDate(fixedNow.Add(time.Hour)),
	}
}

func TestIssueThenVerifyRoundTrip(t *testing.T) {
	manager := newTestManager()

	token, issued, err := manager.Issue(42, time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	if issued.UserID != 42 || issued.JTI == "" || !issued.ExpiresAt.Equal(fixedNow.Add(time.Hour)) {
		t.Fatalf("claims emitidas = %+v", issued)
	}

	verified, err := manager.Verify(token)
	if err != nil {
		t.Fatal(err)
	}
	if verified.UserID != 42 || verified.JTI != issued.JTI || !verified.ExpiresAt.Equal(issued.ExpiresAt) {
		t.Fatalf("claims verificadas = %+v, emitidas = %+v", verified, issued)
	}
}

func TestIssueUsesUniqueTokenIDs(t *testing.T) {
	manager := newTestManager()
	_, first, _ := manager.Issue(1, time.Hour)
	_, second, _ := manager.Issue(1, time.Hour)
	if first.JTI == second.JTI {
		t.Fatal("cada token precisa de um jti próprio")
	}
}

func TestVerifyRejectsInvalidTokens(t *testing.T) {
	manager := newTestManager()
	valid, _, err := manager.Issue(1, time.Hour)
	if err != nil {
		t.Fatal(err)
	}

	expired := validClaims()
	expired.ExpiresAt = jwt.NewNumericDate(fixedNow.Add(-time.Second))

	noExpiry := validClaims()
	noExpiry.ExpiresAt = nil

	wrongIssuer := validClaims()
	wrongIssuer.Issuer = "outro"

	badSubject := validClaims()
	badSubject.Subject = "abc"

	zeroSubject := validClaims()
	zeroSubject.Subject = "0"

	noID := validClaims()
	noID.ID = ""

	secret := []byte(testSecret)
	tests := map[string]string{
		"vazio":             "",
		"lixo":              "nao.e.jwt",
		"expirado":          signClaims(t, jwt.SigningMethodHS256, secret, expired),
		"sem expiração":     signClaims(t, jwt.SigningMethodHS256, secret, noExpiry),
		"emissor errado":    signClaims(t, jwt.SigningMethodHS256, secret, wrongIssuer),
		"subject inválido":  signClaims(t, jwt.SigningMethodHS256, secret, badSubject),
		"subject zero":      signClaims(t, jwt.SigningMethodHS256, secret, zeroSubject),
		"sem jti":           signClaims(t, jwt.SigningMethodHS256, secret, noID),
		"assinatura errada": signClaims(t, jwt.SigningMethodHS256, []byte(strings.Repeat("x", 32)), validClaims()),
		"algoritmo HS512":   signClaims(t, jwt.SigningMethodHS512, secret, validClaims()),
		"alg none":          signClaims(t, jwt.SigningMethodNone, jwt.UnsafeAllowNoneSignatureType, validClaims()),
		"adulterado":        valid[:len(valid)-2] + "xx",
	}

	for name, token := range tests {
		t.Run(name, func(t *testing.T) {
			if _, err := manager.Verify(token); !errors.Is(err, ErrInvalidToken) {
				t.Fatalf("erro = %v, queria ErrInvalidToken", err)
			}
		})
	}
}

func FuzzVerifyToken(f *testing.F) {
	manager := newTestManager()
	valid, _, err := manager.Issue(1, time.Hour)
	if err != nil {
		f.Fatal(err)
	}
	f.Add(valid)
	f.Add("")
	f.Add("a.b.c")
	f.Add("eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.")
	f.Add(strings.Repeat(".", 4096))

	f.Fuzz(func(t *testing.T, token string) {
		claims, err := manager.Verify(token)
		if err != nil {
			if !errors.Is(err, ErrInvalidToken) {
				t.Fatalf("erro fora do contrato: %v", err)
			}
			return
		}
		// Só um token assinado com o segredo pode ser aceito.
		if token != valid {
			if _, parseErr := jwt.Parse(token, func(*jwt.Token) (any, error) { return []byte(testSecret), nil },
				jwt.WithValidMethods([]string{"HS256"}), jwt.WithTimeFunc(manager.Now)); parseErr != nil {
				t.Fatalf("token aceito sem assinatura válida: %q", token)
			}
		}
		if claims.UserID <= 0 || claims.JTI == "" {
			t.Fatalf("claims inválidas aceitas: %+v", claims)
		}
	})
}

func BenchmarkTokenIssue(b *testing.B) {
	manager := NewTokenManager(testSecret)
	b.ReportAllocs()
	for b.Loop() {
		if _, _, err := manager.Issue(1, time.Hour); err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkTokenVerify(b *testing.B) {
	manager := NewTokenManager(testSecret)
	token, _, err := manager.Issue(1, time.Hour)
	if err != nil {
		b.Fatal(err)
	}
	b.ReportAllocs()
	for b.Loop() {
		if _, err := manager.Verify(token); err != nil {
			b.Fatal(err)
		}
	}
}

func TestSubjectIsDecimalUserID(t *testing.T) {
	manager := newTestManager()
	token, _, err := manager.Issue(99, time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	parsed, _, err := jwt.NewParser().ParseUnverified(token, &jwt.RegisteredClaims{})
	if err != nil {
		t.Fatal(err)
	}
	if claims := parsed.Claims.(*jwt.RegisteredClaims); claims.Subject != strconv.Itoa(99) || claims.Issuer != tokenIssuer {
		t.Fatalf("claims = %+v", claims)
	}
}
