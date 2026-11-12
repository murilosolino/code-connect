package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/code-connect/backend/internal/apierror"
	"github.com/code-connect/backend/internal/auth"
	"github.com/gin-gonic/gin"
)

const secret = "0123456789abcdef0123456789abcdef"

type fakeChecker struct {
	revoked bool
	err     error
	seenJTI string
}

func (f *fakeChecker) IsRevoked(_ context.Context, jti string) (bool, error) {
	f.seenJTI = jti
	return f.revoked, f.err
}

func perform(checker *fakeChecker, cookie *http.Cookie) (*httptest.ResponseRecorder, *auth.Claims) {
	gin.SetMode(gin.TestMode)
	var seen *auth.Claims
	engine := gin.New()
	engine.GET("/protegida", RequireSession(auth.NewTokenManager(secret), checker), func(c *gin.Context) {
		claims, ok := ClaimsFrom(c)
		if ok {
			seen = &claims
		}
		c.Status(http.StatusNoContent)
	})

	request := httptest.NewRequest(http.MethodGet, "/protegida", nil)
	if cookie != nil {
		request.AddCookie(cookie)
	}
	recorder := httptest.NewRecorder()
	engine.ServeHTTP(recorder, request)
	return recorder, seen
}

func sessionCookie(t *testing.T, ttl time.Duration) (*http.Cookie, auth.Claims) {
	t.Helper()
	token, claims, err := auth.NewTokenManager(secret).Issue(7, ttl)
	if err != nil {
		t.Fatal(err)
	}
	return &http.Cookie{Name: auth.CookieName, Value: token}, claims
}

func assertErrorCode(t *testing.T, recorder *httptest.ResponseRecorder, status int, code string) {
	t.Helper()
	if recorder.Code != status {
		t.Fatalf("status = %d, want %d", recorder.Code, status)
	}
	var body apierror.Body
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Error.Code != code {
		t.Fatalf("code = %q, want %q", body.Error.Code, code)
	}
}

func TestRequireSessionAcceptsValidToken(t *testing.T) {
	cookie, claims := sessionCookie(t, time.Hour)
	checker := &fakeChecker{}

	recorder, seen := perform(checker, cookie)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("status = %d", recorder.Code)
	}
	if seen == nil || seen.UserID != 7 || seen.JTI != claims.JTI {
		t.Fatalf("claims no contexto = %+v", seen)
	}
	if checker.seenJTI != claims.JTI {
		t.Fatalf("revogação consultada com jti %q", checker.seenJTI)
	}
}

func TestRequireSessionRejectsMissingCookie(t *testing.T) {
	recorder, seen := perform(&fakeChecker{}, nil)
	assertErrorCode(t, recorder, http.StatusUnauthorized, apierror.CodeUnauthenticated)
	if seen != nil {
		t.Fatal("o handler não deve rodar sem sessão")
	}
}

func TestRequireSessionRejectsInvalidToken(t *testing.T) {
	recorder, _ := perform(&fakeChecker{}, &http.Cookie{Name: auth.CookieName, Value: "lixo"})
	assertErrorCode(t, recorder, http.StatusUnauthorized, apierror.CodeUnauthenticated)
}

func TestRequireSessionRejectsExpiredToken(t *testing.T) {
	cookie, _ := sessionCookie(t, -time.Minute)
	recorder, _ := perform(&fakeChecker{}, cookie)
	assertErrorCode(t, recorder, http.StatusUnauthorized, apierror.CodeUnauthenticated)
}

func TestRequireSessionRejectsRevokedToken(t *testing.T) {
	cookie, _ := sessionCookie(t, time.Hour)
	recorder, _ := perform(&fakeChecker{revoked: true}, cookie)
	assertErrorCode(t, recorder, http.StatusUnauthorized, apierror.CodeUnauthenticated)
}

func TestRequireSessionHidesStorageFailure(t *testing.T) {
	cookie, _ := sessionCookie(t, time.Hour)
	recorder, _ := perform(&fakeChecker{err: errors.New("mysql caiu")}, cookie)
	assertErrorCode(t, recorder, http.StatusInternalServerError, apierror.CodeInternal)
	if body := recorder.Body.String(); strings.Contains(body, "mysql") {
		t.Fatalf("detalhe interno exposto: %s", body)
	}
}

func TestClaimsFromWithoutSession(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	if _, ok := ClaimsFrom(ctx); ok {
		t.Fatal("sem sessão não há claims")
	}
}
