// Package middleware reúne os middlewares HTTP da API.
package middleware

import (
	"context"
	"net/http"

	"github.com/code-connect/backend/internal/apierror"
	"github.com/code-connect/backend/internal/auth"
	"github.com/gin-gonic/gin"
)

const (
	claimsKey              = "auth.claims"
	unauthenticatedMessage = "Faça login para continuar."
	internalFailureMessage = "Não foi possível concluir agora. Tente novamente."
)

// TokenVerifier valida o token da sessão.
type TokenVerifier interface {
	Verify(token string) (auth.Claims, error)
}

// RevocationChecker informa se um token foi invalidado por logout.
type RevocationChecker interface {
	IsRevoked(ctx context.Context, jti string) (bool, error)
}

// RequireSession só deixa passar requisições com sessão válida e não revogada.
func RequireSession(tokens TokenVerifier, revocations RevocationChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie(auth.CookieName)
		if err != nil {
			respondUnauthenticated(c)
			return
		}

		claims, err := tokens.Verify(cookie)
		if err != nil {
			respondUnauthenticated(c)
			return
		}

		revoked, err := revocations.IsRevoked(c.Request.Context(), claims.JTI)
		if err != nil {
			_ = c.Error(err)
			apierror.Respond(c, http.StatusInternalServerError, apierror.CodeInternal, internalFailureMessage, nil)
			return
		}
		if revoked {
			respondUnauthenticated(c)
			return
		}

		c.Set(claimsKey, claims)
		c.Next()
	}
}

// ClaimsFrom devolve os dados da sessão colocados por RequireSession.
func ClaimsFrom(c *gin.Context) (auth.Claims, bool) {
	value, exists := c.Get(claimsKey)
	if !exists {
		return auth.Claims{}, false
	}
	claims, ok := value.(auth.Claims)
	return claims, ok
}

func respondUnauthenticated(c *gin.Context) {
	apierror.Respond(c, http.StatusUnauthorized, apierror.CodeUnauthenticated, unauthenticatedMessage, nil)
}
