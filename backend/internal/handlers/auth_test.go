package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/code-connect/backend/internal/apierror"
	"github.com/code-connect/backend/internal/auth"
	"github.com/code-connect/backend/internal/middleware"
	"github.com/code-connect/backend/internal/store"
	"github.com/gin-gonic/gin"
)

const (
	testSecret  = "0123456789abcdef0123456789abcdef"
	ttl         = 24 * time.Hour
	rememberTTL = 720 * time.Hour
)

var errBoom = errors.New("mysql caiu em 10.0.0.1")

type fakeUsers struct {
	users     []store.User
	createErr []error
	created   []store.NewUser
	findErr   error
}

func (f *fakeUsers) Create(_ context.Context, user store.NewUser) (store.User, error) {
	f.created = append(f.created, user)
	if len(f.createErr) > 0 {
		err := f.createErr[0]
		f.createErr = f.createErr[1:]
		if err != nil {
			return store.User{}, err
		}
	}
	saved := store.User{
		ID: int64(len(f.users) + 1), Handle: user.Handle, Name: user.Name,
		Email: user.Email, PasswordHash: user.PasswordHash,
	}
	f.users = append(f.users, saved)
	return saved, nil
}

func (f *fakeUsers) find(match func(store.User) bool) (store.User, error) {
	if f.findErr != nil {
		return store.User{}, f.findErr
	}
	for _, user := range f.users {
		if match(user) {
			return user, nil
		}
	}
	return store.User{}, store.ErrNotFound
}

func (f *fakeUsers) FindByEmail(_ context.Context, email string) (store.User, error) {
	return f.find(func(u store.User) bool { return u.Email == email })
}

func (f *fakeUsers) FindByHandle(_ context.Context, handle string) (store.User, error) {
	return f.find(func(u store.User) bool { return u.Handle == handle })
}

func (f *fakeUsers) FindByID(_ context.Context, id int64) (store.User, error) {
	return f.find(func(u store.User) bool { return u.ID == id })
}

type fakeHasher struct {
	hashErr    error
	compareErr error
	dummyCalls int
}

func (f *fakeHasher) Hash(password string) (string, error) {
	if f.hashErr != nil {
		return "", f.hashErr
	}
	return "hash:" + password, nil
}

func (f *fakeHasher) Compare(hash, password string) error {
	if f.compareErr != nil {
		return f.compareErr
	}
	if hash != "hash:"+password {
		return auth.ErrPasswordMismatch
	}
	return nil
}

func (f *fakeHasher) CompareDummy(string) { f.dummyCalls++ }

type fakeRevocations struct {
	revoked   map[string]time.Time
	revokeErr error
}

func (f *fakeRevocations) Revoke(_ context.Context, jti string, expiresAt time.Time) error {
	if f.revokeErr != nil {
		return f.revokeErr
	}
	f.revoked[jti] = expiresAt
	return nil
}

func (f *fakeRevocations) IsRevoked(_ context.Context, jti string) (bool, error) {
	_, ok := f.revoked[jti]
	return ok, nil
}

type spyIssuer struct {
	inner    *auth.TokenManager
	lastTTL  time.Duration
	issueErr error
}

func (s *spyIssuer) Issue(userID int64, ttl time.Duration) (string, auth.Claims, error) {
	s.lastTTL = ttl
	if s.issueErr != nil {
		return "", auth.Claims{}, s.issueErr
	}
	return s.inner.Issue(userID, ttl)
}

type harness struct {
	users       *fakeUsers
	hasher      *fakeHasher
	revocations *fakeRevocations
	issuer      *spyIssuer
	tokens      *auth.TokenManager
	engine      *gin.Engine
}

func newHarness() *harness {
	gin.SetMode(gin.TestMode)
	tokens := auth.NewTokenManager(testSecret)
	h := &harness{
		users:       &fakeUsers{},
		hasher:      &fakeHasher{},
		revocations: &fakeRevocations{revoked: map[string]time.Time{}},
		issuer:      &spyIssuer{inner: tokens},
		tokens:      tokens,
		engine:      gin.New(),
	}
	handler := Auth{
		Users: h.users, Tokens: h.issuer, Hasher: h.hasher, Revocations: h.revocations,
		CookieSecure: true, TTL: ttl, RememberTTL: rememberTTL,
	}
	session := middleware.RequireSession(tokens, h.revocations)
	h.engine.POST("/api/auth/signup", handler.Signup)
	h.engine.POST("/api/auth/login", handler.Login)
	h.engine.POST("/api/auth/logout", session, handler.Logout)
	h.engine.GET("/api/auth/me", session, handler.Me)
	return h
}

func (h *harness) seedUser(handle, email string) store.User {
	user := store.User{
		ID: int64(len(h.users.users) + 1), Handle: handle, Name: "Maria Lima",
		Email: email, PasswordHash: "hash:senha-segura",
	}
	h.users.users = append(h.users.users, user)
	return user
}

func (h *harness) send(method, path, body string, cookies ...*http.Cookie) *httptest.ResponseRecorder {
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	for _, cookie := range cookies {
		request.AddCookie(cookie)
	}
	recorder := httptest.NewRecorder()
	h.engine.ServeHTTP(recorder, request)
	return recorder
}

func (h *harness) session(t *testing.T, userID int64) (*http.Cookie, auth.Claims) {
	t.Helper()
	token, claims, err := h.tokens.Issue(userID, time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	return &http.Cookie{Name: auth.CookieName, Value: token}, claims
}

func errorBody(t *testing.T, recorder *httptest.ResponseRecorder) apierror.Detail {
	t.Helper()
	var body apierror.Body
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("corpo de erro inválido %q: %v", recorder.Body.String(), err)
	}
	return body.Error
}

func viewerBody(t *testing.T, recorder *httptest.ResponseRecorder) Viewer {
	t.Helper()
	var viewer Viewer
	if err := json.Unmarshal(recorder.Body.Bytes(), &viewer); err != nil {
		t.Fatal(err)
	}
	return viewer
}

func cookieOf(t *testing.T, recorder *httptest.ResponseRecorder) *http.Cookie {
	t.Helper()
	for _, cookie := range recorder.Result().Cookies() {
		if cookie.Name == auth.CookieName {
			return cookie
		}
	}
	t.Fatal("cookie de sessão ausente")
	return nil
}

func assertSessionCookie(t *testing.T, cookie *http.Cookie) {
	t.Helper()
	if !cookie.HttpOnly || !cookie.Secure || cookie.SameSite != http.SameSiteLaxMode || cookie.Path != "/api" {
		t.Fatalf("atributos do cookie incorretos: %+v", cookie)
	}
}

func assertStatus(t *testing.T, recorder *httptest.ResponseRecorder, want int) {
	t.Helper()
	if recorder.Code != want {
		t.Fatalf("status = %d, want %d; corpo: %s", recorder.Code, want, recorder.Body.String())
	}
}

func assertNoLeak(t *testing.T, recorder *httptest.ResponseRecorder) {
	t.Helper()
	assertStatus(t, recorder, http.StatusInternalServerError)
	if body := recorder.Body.String(); strings.Contains(body, "mysql") || strings.Contains(body, "10.0.0.1") {
		t.Fatalf("detalhe interno exposto: %s", body)
	}
	if code := errorBody(t, recorder).Code; code != apierror.CodeInternal {
		t.Fatalf("code = %q", code)
	}
}

const validSignup = `{"name":"  Maria Lima ","email":" Maria@X.com ","password":"senha-segura"}`

func TestSignupCreatesAccountAndSession(t *testing.T) {
	h := newHarness()

	recorder := h.send(http.MethodPost, "/api/auth/signup", validSignup)

	assertStatus(t, recorder, http.StatusCreated)
	viewer := viewerBody(t, recorder)
	if viewer.Handle != "maria" || viewer.Name != "Maria Lima" || viewer.Initials != "ML" || viewer.AvatarURL != nil {
		t.Fatalf("viewer = %+v", viewer)
	}
	created := h.users.created[0]
	if created.Email != "maria@x.com" || created.Name != "Maria Lima" || created.PasswordHash != "hash:senha-segura" {
		t.Fatalf("usuário criado = %+v", created)
	}
	if strings.Contains(recorder.Body.String(), "senha") || strings.Contains(recorder.Body.String(), "hash") {
		t.Fatalf("resposta expõe credenciais: %s", recorder.Body.String())
	}

	cookie := cookieOf(t, recorder)
	assertSessionCookie(t, cookie)
	if cookie.MaxAge != 0 {
		t.Fatalf("sem lembrar-me o cookie é de sessão: MaxAge = %d", cookie.MaxAge)
	}
	if h.issuer.lastTTL != ttl {
		t.Fatalf("ttl = %v", h.issuer.lastTTL)
	}
	if claims, err := h.tokens.Verify(cookie.Value); err != nil || claims.UserID != 1 {
		t.Fatalf("token do cookie: %+v, %v", claims, err)
	}
}

func TestSignupRememberExtendsSession(t *testing.T) {
	h := newHarness()

	recorder := h.send(http.MethodPost, "/api/auth/signup",
		`{"name":"Maria","email":"maria@x.com","password":"senha-segura","remember":true}`)

	assertStatus(t, recorder, http.StatusCreated)
	if h.issuer.lastTTL != rememberTTL {
		t.Fatalf("ttl = %v", h.issuer.lastTTL)
	}
	if cookie := cookieOf(t, recorder); cookie.MaxAge != int(rememberTTL.Seconds()) {
		t.Fatalf("MaxAge = %d", cookie.MaxAge)
	}
}

func TestSignupRejectsBadBodies(t *testing.T) {
	tests := map[string]string{
		"vazio":        "",
		"malformado":   `{"name":`,
		"tipo errado":  `{"name":1,"email":"m@x.com","password":"senha-segura"}`,
		"não é objeto": `[]`,
	}
	for name, body := range tests {
		t.Run(name, func(t *testing.T) {
			recorder := newHarness().send(http.MethodPost, "/api/auth/signup", body)
			assertStatus(t, recorder, http.StatusBadRequest)
			if code := errorBody(t, recorder).Code; code != apierror.CodeInvalidBody {
				t.Fatalf("code = %q", code)
			}
		})
	}
}

func TestSignupRejectsOversizedBody(t *testing.T) {
	body := `{"name":"` + strings.Repeat("a", maxAuthBodyBytes) + `"}`
	recorder := newHarness().send(http.MethodPost, "/api/auth/signup", body)
	assertStatus(t, recorder, http.StatusRequestEntityTooLarge)
	if code := errorBody(t, recorder).Code; code != apierror.CodeBodyTooLarge {
		t.Fatalf("code = %q", code)
	}
}

func TestSignupValidatesFields(t *testing.T) {
	h := newHarness()

	recorder := h.send(http.MethodPost, "/api/auth/signup", `{"name":" ","email":"x","password":"curta"}`)

	assertStatus(t, recorder, http.StatusUnprocessableEntity)
	detail := errorBody(t, recorder)
	if detail.Code != apierror.CodeValidation {
		t.Fatalf("code = %q", detail.Code)
	}
	if detail.Fields["name"] != auth.MsgNameRequired || detail.Fields["email"] != auth.MsgEmailInvalid ||
		detail.Fields["password"] != auth.MsgPasswordTooShort {
		t.Fatalf("fields = %+v", detail.Fields)
	}
	if len(h.users.created) != 0 {
		t.Fatal("dado inválido não pode chegar ao banco")
	}
}

func TestSignupReportsTakenEmail(t *testing.T) {
	h := newHarness()
	h.users.createErr = []error{store.ErrEmailTaken}

	recorder := h.send(http.MethodPost, "/api/auth/signup", validSignup)

	assertStatus(t, recorder, http.StatusConflict)
	detail := errorBody(t, recorder)
	if detail.Code != apierror.CodeConflict || detail.Fields["email"] != auth.MsgEmailTaken {
		t.Fatalf("erro = %+v", detail)
	}
	if len(recorder.Result().Cookies()) != 0 {
		t.Fatal("conflito não abre sessão")
	}
}

func TestSignupRetriesHandleCollisions(t *testing.T) {
	h := newHarness()
	h.users.createErr = []error{store.ErrHandleTaken, store.ErrHandleTaken}

	recorder := h.send(http.MethodPost, "/api/auth/signup", validSignup)

	assertStatus(t, recorder, http.StatusCreated)
	if viewer := viewerBody(t, recorder); viewer.Handle != "maria3" {
		t.Fatalf("handle = %q", viewer.Handle)
	}
	var handles []string
	for _, attempt := range h.users.created {
		handles = append(handles, attempt.Handle)
	}
	if strings.Join(handles, ",") != "maria,maria2,maria3" {
		t.Fatalf("tentativas = %v", handles)
	}
}

func TestSignupFallsBackToRandomSuffix(t *testing.T) {
	h := newHarness()
	for range sequentialHandleAttempts {
		h.users.createErr = append(h.users.createErr, store.ErrHandleTaken)
	}

	recorder := h.send(http.MethodPost, "/api/auth/signup", validSignup)

	assertStatus(t, recorder, http.StatusCreated)
	if handle := viewerBody(t, recorder).Handle; !regexp.MustCompile(`^maria\d{6}$`).MatchString(handle) {
		t.Fatalf("handle = %q", handle)
	}
}

func TestSignupGivesUpAfterAllAttempts(t *testing.T) {
	h := newHarness()
	for range sequentialHandleAttempts + randomHandleAttempts {
		h.users.createErr = append(h.users.createErr, store.ErrHandleTaken)
	}
	assertNoLeak(t, h.send(http.MethodPost, "/api/auth/signup", validSignup))
}

func TestSignupHidesInternalFailures(t *testing.T) {
	t.Run("banco", func(t *testing.T) {
		h := newHarness()
		h.users.createErr = []error{errBoom}
		assertNoLeak(t, h.send(http.MethodPost, "/api/auth/signup", validSignup))
	})
	t.Run("hash", func(t *testing.T) {
		h := newHarness()
		h.hasher.hashErr = errBoom
		assertNoLeak(t, h.send(http.MethodPost, "/api/auth/signup", validSignup))
	})
	t.Run("token", func(t *testing.T) {
		h := newHarness()
		h.issuer.issueErr = errBoom
		assertNoLeak(t, h.send(http.MethodPost, "/api/auth/signup", validSignup))
	})
}

func TestLoginByEmailAndHandle(t *testing.T) {
	tests := map[string]string{
		"email":             `{"identifier":"maria@x.com","password":"senha-segura"}`,
		"email normalizado": `{"identifier":"  MARIA@X.COM ","password":"senha-segura"}`,
		"handle":            `{"identifier":"maria","password":"senha-segura"}`,
		"handle maiúsculo":  `{"identifier":" Maria ","password":"senha-segura"}`,
	}
	for name, body := range tests {
		t.Run(name, func(t *testing.T) {
			h := newHarness()
			h.seedUser("maria", "maria@x.com")

			recorder := h.send(http.MethodPost, "/api/auth/login", body)

			assertStatus(t, recorder, http.StatusOK)
			if viewer := viewerBody(t, recorder); viewer.Handle != "maria" {
				t.Fatalf("viewer = %+v", viewer)
			}
			assertSessionCookie(t, cookieOf(t, recorder))
			if h.issuer.lastTTL != ttl {
				t.Fatalf("ttl = %v", h.issuer.lastTTL)
			}
		})
	}
}

func TestLoginRememberExtendsSession(t *testing.T) {
	h := newHarness()
	h.seedUser("maria", "maria@x.com")

	recorder := h.send(http.MethodPost, "/api/auth/login",
		`{"identifier":"maria","password":"senha-segura","remember":true}`)

	assertStatus(t, recorder, http.StatusOK)
	if cookie := cookieOf(t, recorder); cookie.MaxAge != int(rememberTTL.Seconds()) || h.issuer.lastTTL != rememberTTL {
		t.Fatalf("MaxAge = %d, ttl = %v", cookie.MaxAge, h.issuer.lastTTL)
	}
}

func TestLoginFailureDoesNotRevealAccounts(t *testing.T) {
	h := newHarness()
	h.seedUser("maria", "maria@x.com")

	wrongPassword := h.send(http.MethodPost, "/api/auth/login", `{"identifier":"maria","password":"errada"}`)
	if h.hasher.dummyCalls != 0 {
		t.Fatal("conta existente usa a comparação real")
	}
	unknownUser := h.send(http.MethodPost, "/api/auth/login", `{"identifier":"ninguem","password":"errada"}`)

	assertStatus(t, wrongPassword, http.StatusUnauthorized)
	assertStatus(t, unknownUser, http.StatusUnauthorized)
	if wrongPassword.Body.String() != unknownUser.Body.String() {
		t.Fatalf("respostas diferentes: %s / %s", wrongPassword.Body, unknownUser.Body)
	}
	if h.hasher.dummyCalls != 1 {
		t.Fatalf("CompareDummy chamado %d vezes", h.hasher.dummyCalls)
	}
	detail := errorBody(t, unknownUser)
	if detail.Code != apierror.CodeInvalidLogin || detail.Fields["password"] != auth.MsgInvalidCredentials {
		t.Fatalf("erro = %+v", detail)
	}
	if len(unknownUser.Result().Cookies()) != 0 {
		t.Fatal("falha de login não abre sessão")
	}
}

func TestLoginValidation(t *testing.T) {
	recorder := newHarness().send(http.MethodPost, "/api/auth/login", `{"identifier":" ","password":""}`)
	assertStatus(t, recorder, http.StatusUnprocessableEntity)
	fields := errorBody(t, recorder).Fields
	if fields["identifier"] != auth.MsgIdentifierRequired || fields["password"] != auth.MsgPasswordRequired {
		t.Fatalf("fields = %+v", fields)
	}
}

func TestLoginRejectsMalformedBody(t *testing.T) {
	assertStatus(t, newHarness().send(http.MethodPost, "/api/auth/login", `{`), http.StatusBadRequest)
}

func TestLoginHidesInternalFailures(t *testing.T) {
	body := `{"identifier":"maria","password":"senha-segura"}`
	t.Run("banco", func(t *testing.T) {
		h := newHarness()
		h.users.findErr = errBoom
		assertNoLeak(t, h.send(http.MethodPost, "/api/auth/login", body))
	})
	t.Run("hash corrompido", func(t *testing.T) {
		h := newHarness()
		h.seedUser("maria", "maria@x.com")
		h.hasher.compareErr = errBoom
		assertNoLeak(t, h.send(http.MethodPost, "/api/auth/login", body))
	})
	t.Run("token", func(t *testing.T) {
		h := newHarness()
		h.seedUser("maria", "maria@x.com")
		h.issuer.issueErr = errBoom
		assertNoLeak(t, h.send(http.MethodPost, "/api/auth/login", body))
	})
}

func TestLogoutRevokesTokenAndClearsCookie(t *testing.T) {
	h := newHarness()
	user := h.seedUser("maria", "maria@x.com")
	cookie, claims := h.session(t, user.ID)

	recorder := h.send(http.MethodPost, "/api/auth/logout", "", cookie)

	assertStatus(t, recorder, http.StatusNoContent)
	if expiresAt, ok := h.revocations.revoked[claims.JTI]; !ok || !expiresAt.Equal(claims.ExpiresAt) {
		t.Fatalf("revogações = %+v", h.revocations.revoked)
	}
	cleared := cookieOf(t, recorder)
	assertSessionCookie(t, cleared)
	if cleared.MaxAge >= 0 || cleared.Value != "" {
		t.Fatalf("cookie não foi apagado: %+v", cleared)
	}

	assertStatus(t, h.send(http.MethodGet, "/api/auth/me", "", cookie), http.StatusUnauthorized)
}

func TestLogoutRequiresSession(t *testing.T) {
	assertStatus(t, newHarness().send(http.MethodPost, "/api/auth/logout", ""), http.StatusUnauthorized)
}

func TestLogoutHidesRevocationFailure(t *testing.T) {
	h := newHarness()
	cookie, _ := h.session(t, 1)
	h.revocations.revokeErr = errBoom
	assertNoLeak(t, h.send(http.MethodPost, "/api/auth/logout", "", cookie))
}

func TestMeReturnsViewer(t *testing.T) {
	h := newHarness()
	user := h.seedUser("maria", "maria@x.com")
	avatar := "/api/images/a.png"
	h.users.users[0].AvatarURL = &avatar
	cookie, _ := h.session(t, user.ID)

	recorder := h.send(http.MethodGet, "/api/auth/me", "", cookie)

	assertStatus(t, recorder, http.StatusOK)
	viewer := viewerBody(t, recorder)
	if viewer.Handle != "maria" || viewer.Initials != "ML" || viewer.AvatarURL == nil || *viewer.AvatarURL != avatar {
		t.Fatalf("viewer = %+v", viewer)
	}
	if strings.Contains(recorder.Body.String(), "maria@x.com") {
		t.Fatalf("/me não precisa expor o email: %s", recorder.Body.String())
	}
}

func TestMeWithoutSession(t *testing.T) {
	assertStatus(t, newHarness().send(http.MethodGet, "/api/auth/me", ""), http.StatusUnauthorized)
}

func TestMeWithRemovedUser(t *testing.T) {
	h := newHarness()
	cookie, _ := h.session(t, 99)
	recorder := h.send(http.MethodGet, "/api/auth/me", "", cookie)
	assertStatus(t, recorder, http.StatusUnauthorized)
	if code := errorBody(t, recorder).Code; code != apierror.CodeUnauthenticated {
		t.Fatalf("code = %q", code)
	}
}

func TestMeHidesStorageFailure(t *testing.T) {
	h := newHarness()
	cookie, _ := h.session(t, 1)
	h.users.findErr = errBoom
	assertNoLeak(t, h.send(http.MethodGet, "/api/auth/me", "", cookie))
}

func FuzzLoginBody(f *testing.F) {
	f.Add([]byte(`{"identifier":"maria","password":"senha-segura"}`))
	f.Add([]byte(`{"identifier":"maria@x.com","password":"senha-segura","remember":true}`))
	f.Add([]byte(`{}`))
	f.Add([]byte(`null`))
	f.Add([]byte(`{"identifier":123}`))
	f.Add([]byte{0xff, 0x00, '{'})
	f.Add([]byte(`{"identifier":"` + strings.Repeat("a", 5000) + `","password":"x"}`))

	h := newHarness()
	h.seedUser("maria", "maria@x.com")

	f.Fuzz(func(t *testing.T, body []byte) {
		recorder := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewReader(body))
		request.Header.Set("Content-Type", "application/json")

		h.engine.ServeHTTP(recorder, request)

		if recorder.Code >= http.StatusInternalServerError {
			t.Fatalf("status %d para %q", recorder.Code, body)
		}
		if recorder.Code != http.StatusOK && !json.Valid(recorder.Body.Bytes()) {
			t.Fatalf("erro sem JSON válido: %q", recorder.Body.String())
		}
	})
}

func BenchmarkMeWithSession(b *testing.B) {
	h := newHarness()
	user := h.seedUser("maria", "maria@x.com")
	token, _, err := h.tokens.Issue(user.ID, time.Hour)
	if err != nil {
		b.Fatal(err)
	}
	cookie := &http.Cookie{Name: auth.CookieName, Value: token}

	b.ReportAllocs()
	for b.Loop() {
		recorder := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodGet, "/api/auth/me", nil)
		request.AddCookie(cookie)
		h.engine.ServeHTTP(recorder, request)
		if recorder.Code != http.StatusOK {
			b.Fatalf("status = %d", recorder.Code)
		}
	}
}
