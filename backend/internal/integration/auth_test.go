package integration

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/code-connect/backend/internal/apierror"
	"github.com/code-connect/backend/internal/auth"
	"github.com/code-connect/backend/internal/database"
	"github.com/code-connect/backend/internal/handlers"
)

const signupBody = `{"name":"Maria Lima","email":"maria@x.com","password":"senha-segura"}`

func sessionCookie(t *testing.T, recorder *httptest.ResponseRecorder) *http.Cookie {
	t.Helper()
	for _, cookie := range recorder.Result().Cookies() {
		if cookie.Name == auth.CookieName {
			return cookie
		}
	}
	t.Fatalf("sem cookie de sessão; status %d, corpo %s", recorder.Code, recorder.Body.String())
	return nil
}

func decodeViewer(t *testing.T, recorder *httptest.ResponseRecorder) handlers.Viewer {
	t.Helper()
	var viewer handlers.Viewer
	if err := json.Unmarshal(recorder.Body.Bytes(), &viewer); err != nil {
		t.Fatalf("corpo %q: %v", recorder.Body.String(), err)
	}
	return viewer
}

func decodeError(t *testing.T, recorder *httptest.ResponseRecorder) apierror.Detail {
	t.Helper()
	var body apierror.Body
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("corpo %q: %v", recorder.Body.String(), err)
	}
	return body.Error
}

func expectStatus(t *testing.T, recorder *httptest.ResponseRecorder, want int) {
	t.Helper()
	if recorder.Code != want {
		t.Fatalf("status = %d, want %d; corpo: %s", recorder.Code, want, recorder.Body.String())
	}
}

func signup(t *testing.T, api http.Handler, body string) *httptest.ResponseRecorder {
	t.Helper()
	recorder := send(api, http.MethodPost, "/api/auth/signup", body)
	expectStatus(t, recorder, http.StatusCreated)
	return recorder
}

func TestMigrateIsIdempotent(t *testing.T) {
	if err := database.Migrate(context.Background(), testDB); err != nil {
		t.Fatal(err)
	}
	var applied int
	if err := testDB.QueryRow("SELECT COUNT(*) FROM schema_migrations").Scan(&applied); err != nil {
		t.Fatal(err)
	}
	if applied < 2 {
		t.Fatalf("migrações aplicadas = %d", applied)
	}
}

func TestFullSessionFlow(t *testing.T) {
	api := newAPI(t)

	created := signup(t, api, signupBody)
	viewer := decodeViewer(t, created)
	if viewer.Handle != "maria" || viewer.Name != "Maria Lima" || viewer.Initials != "ML" {
		t.Fatalf("viewer = %+v", viewer)
	}
	cookie := sessionCookie(t, created)
	if !cookie.HttpOnly || cookie.SameSite != http.SameSiteLaxMode || cookie.Path != "/api" || cookie.MaxAge != 0 {
		t.Fatalf("cookie = %+v", cookie)
	}

	me := send(api, http.MethodGet, "/api/auth/me", "", cookie)
	expectStatus(t, me, http.StatusOK)
	if decodeViewer(t, me).Handle != "maria" {
		t.Fatalf("me = %s", me.Body.String())
	}

	logout := send(api, http.MethodPost, "/api/auth/logout", "", cookie)
	expectStatus(t, logout, http.StatusNoContent)
	if cleared := sessionCookie(t, logout); cleared.MaxAge >= 0 {
		t.Fatalf("cookie não apagado: %+v", cleared)
	}

	// Reusar o token depois do logout não pode funcionar.
	expectStatus(t, send(api, http.MethodGet, "/api/auth/me", "", cookie), http.StatusUnauthorized)
	expectStatus(t, send(api, http.MethodPost, "/api/auth/logout", "", cookie), http.StatusUnauthorized)
}

func TestSignupStoresHashNotPassword(t *testing.T) {
	api := newAPI(t)
	signup(t, api, signupBody)

	var hash, email string
	if err := testDB.QueryRow("SELECT password_hash, email FROM users").Scan(&hash, &email); err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(hash, "$2") || strings.Contains(hash, "senha-segura") {
		t.Fatalf("hash = %q", hash)
	}
	if email != "maria@x.com" {
		t.Fatalf("email = %q", email)
	}
}

func TestSignupValidationAndConflict(t *testing.T) {
	api := newAPI(t)
	signup(t, api, signupBody)

	duplicate := send(api, http.MethodPost, "/api/auth/signup",
		`{"name":"Outra","email":"MARIA@x.com","password":"senha-segura"}`)
	expectStatus(t, duplicate, http.StatusConflict)
	if detail := decodeError(t, duplicate); detail.Fields["email"] != auth.MsgEmailTaken {
		t.Fatalf("erro = %+v", detail)
	}

	invalid := send(api, http.MethodPost, "/api/auth/signup", `{"name":"","email":"x","password":"123"}`)
	expectStatus(t, invalid, http.StatusUnprocessableEntity)
	if fields := decodeError(t, invalid).Fields; len(fields) != 3 {
		t.Fatalf("fields = %+v", fields)
	}

	expectStatus(t, send(api, http.MethodPost, "/api/auth/signup", `{"name":`), http.StatusBadRequest)
}

func TestEmailContainingKeyNameIsNotHandleCollision(t *testing.T) {
	api := newAPI(t)
	body := `{"name":"Maria","email":"uq_users_handle@x.com","password":"senha-segura"}`
	signup(t, api, body)
	// A mensagem de duplicidade do MySQL inclui o valor; o email não pode confundir a detecção.
	expectStatus(t, send(api, http.MethodPost, "/api/auth/signup", body), http.StatusConflict)
}

func TestHandleCollisionUsesNextSuffix(t *testing.T) {
	api := newAPI(t)

	first := signup(t, api, `{"name":"Um","email":"maria@a.com","password":"senha-segura"}`)
	second := signup(t, api, `{"name":"Dois","email":"maria@b.com","password":"senha-segura"}`)
	third := signup(t, api, `{"name":"Três","email":"Maria@c.com","password":"senha-segura"}`)

	got := []string{decodeViewer(t, first).Handle, decodeViewer(t, second).Handle, decodeViewer(t, third).Handle}
	if strings.Join(got, ",") != "maria,maria2,maria3" {
		t.Fatalf("handles = %v", got)
	}
}

func TestConcurrentSignupsWithSameLocalPart(t *testing.T) {
	api := newAPI(t)
	const total = 8

	var wg sync.WaitGroup
	statuses := make([]int, total)
	for i := range total {
		wg.Add(1)
		go func() {
			defer wg.Done()
			body := fmt.Sprintf(`{"name":"Pessoa","email":"maria@d%d.com","password":"senha-segura"}`, i)
			statuses[i] = send(api, http.MethodPost, "/api/auth/signup", body).Code
		}()
	}
	wg.Wait()

	for i, status := range statuses {
		if status != http.StatusCreated {
			t.Fatalf("signup %d: status %d", i, status)
		}
	}
	var distinct int
	if err := testDB.QueryRow("SELECT COUNT(DISTINCT handle) FROM users").Scan(&distinct); err != nil {
		t.Fatal(err)
	}
	if distinct != total {
		t.Fatalf("handles distintos = %d", distinct)
	}
}

func TestConcurrentSignupsWithSameEmail(t *testing.T) {
	api := newAPI(t)
	const total = 6

	var wg sync.WaitGroup
	statuses := make([]int, total)
	for i := range total {
		wg.Add(1)
		go func() {
			defer wg.Done()
			statuses[i] = send(api, http.MethodPost, "/api/auth/signup", signupBody).Code
		}()
	}
	wg.Wait()

	created := 0
	for _, status := range statuses {
		switch status {
		case http.StatusCreated:
			created++
		case http.StatusConflict:
		default:
			t.Fatalf("status inesperado: %d", status)
		}
	}
	if created != 1 {
		t.Fatalf("contas criadas = %d", created)
	}
}

func TestLoginByEmailAndHandle(t *testing.T) {
	api := newAPI(t)
	signup(t, api, signupBody)

	for _, identifier := range []string{"maria@x.com", " MARIA@X.COM", "maria", "MARIA"} {
		body := fmt.Sprintf(`{"identifier":%q,"password":"senha-segura"}`, identifier)
		login := send(api, http.MethodPost, "/api/auth/login", body)
		expectStatus(t, login, http.StatusOK)
		expectStatus(t, send(api, http.MethodGet, "/api/auth/me", "", sessionCookie(t, login)), http.StatusOK)
	}
}

func TestLoginRememberSetsPersistentCookie(t *testing.T) {
	api := newAPI(t)
	signup(t, api, signupBody)

	login := send(api, http.MethodPost, "/api/auth/login",
		`{"identifier":"maria","password":"senha-segura","remember":true}`)

	expectStatus(t, login, http.StatusOK)
	if cookie := sessionCookie(t, login); cookie.MaxAge != int((48 * time.Hour).Seconds()) {
		t.Fatalf("MaxAge = %d", cookie.MaxAge)
	}
}

func TestLoginFailures(t *testing.T) {
	api := newAPI(t)
	signup(t, api, signupBody)

	wrong := send(api, http.MethodPost, "/api/auth/login", `{"identifier":"maria","password":"errada-1234"}`)
	unknown := send(api, http.MethodPost, "/api/auth/login", `{"identifier":"ninguem","password":"errada-1234"}`)

	expectStatus(t, wrong, http.StatusUnauthorized)
	expectStatus(t, unknown, http.StatusUnauthorized)
	if wrong.Body.String() != unknown.Body.String() {
		t.Fatalf("respostas diferentes: %s / %s", wrong.Body, unknown.Body)
	}
	expectStatus(t, send(api, http.MethodPost, "/api/auth/login", `{"identifier":"","password":""}`), http.StatusUnprocessableEntity)
	expectStatus(t, send(api, http.MethodPost, "/api/auth/login", `nao-json`), http.StatusBadRequest)
}

func TestSQLInjectionAttemptsAreInert(t *testing.T) {
	api := newAPI(t)
	signup(t, api, signupBody)

	body := `{"identifier":"' OR '1'='1' -- ","password":"qualquer"}`
	expectStatus(t, send(api, http.MethodPost, "/api/auth/login", body), http.StatusUnauthorized)

	var count int
	if err := testDB.QueryRow("SELECT COUNT(*) FROM users").Scan(&count); err != nil || count != 1 {
		t.Fatalf("usuários = %d, err = %v", count, err)
	}
}

func TestMeRejectsInvalidSessions(t *testing.T) {
	api := newAPI(t)

	expectStatus(t, send(api, http.MethodGet, "/api/auth/me", ""), http.StatusUnauthorized)

	lixo := &http.Cookie{Name: auth.CookieName, Value: "lixo"}
	expectStatus(t, send(api, http.MethodGet, "/api/auth/me", "", lixo), http.StatusUnauthorized)

	tokens := auth.NewTokenManager(testSecret)
	expired, _, err := tokens.Issue(1, -time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	expiredCookie := &http.Cookie{Name: auth.CookieName, Value: expired}
	expectStatus(t, send(api, http.MethodGet, "/api/auth/me", "", expiredCookie), http.StatusUnauthorized)

	otherKey, _, err := auth.NewTokenManager(strings.Repeat("z", 32)).Issue(1, time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	otherCookie := &http.Cookie{Name: auth.CookieName, Value: otherKey}
	expectStatus(t, send(api, http.MethodGet, "/api/auth/me", "", otherCookie), http.StatusUnauthorized)
}

func TestMeWithRemovedUser(t *testing.T) {
	api := newAPI(t)
	cookie := sessionCookie(t, signup(t, api, signupBody))

	if _, err := testDB.Exec("DELETE FROM users"); err != nil {
		t.Fatal(err)
	}

	expectStatus(t, send(api, http.MethodGet, "/api/auth/me", "", cookie), http.StatusUnauthorized)
}

func TestLogoutPurgesExpiredRevocations(t *testing.T) {
	api := newAPI(t)
	if _, err := testDB.Exec("INSERT INTO revoked_tokens (jti, expires_at) VALUES ('velho', ?)",
		time.Now().UTC().Add(-time.Hour)); err != nil {
		t.Fatal(err)
	}
	cookie := sessionCookie(t, signup(t, api, signupBody))

	expectStatus(t, send(api, http.MethodPost, "/api/auth/logout", "", cookie), http.StatusNoContent)

	var old int
	if err := testDB.QueryRow("SELECT COUNT(*) FROM revoked_tokens WHERE jti = 'velho'").Scan(&old); err != nil || old != 0 {
		t.Fatalf("revogação expirada mantida: %d, err = %v", old, err)
	}
}
