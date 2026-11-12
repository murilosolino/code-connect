package handlers

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/code-connect/backend/internal/apierror"
	"github.com/code-connect/backend/internal/auth"
	"github.com/code-connect/backend/internal/middleware"
	"github.com/code-connect/backend/internal/store"
	"github.com/gin-gonic/gin"
)

const (
	maxAuthBodyBytes = 16 << 10

	// Primeiro tenta o handle puro e sufixos sequenciais; depois, sufixos aleatórios, para
	// um nome muito comum não exigir centenas de inserções.
	sequentialHandleAttempts = 5
	randomHandleAttempts     = 5
	randomSuffixLimit        = 1_000_000

	cookiePath = "/api"

	msgInvalidBody     = "Não foi possível ler os dados enviados."
	msgBodyTooLarge    = "Os dados enviados são grandes demais."
	msgValidation      = "Confira os campos destacados."
	msgEmailConflict   = "Este email já está em uso."
	msgInvalidLogin    = "Não foi possível entrar."
	msgUnauthenticated = "Faça login para continuar."
	msgInternal        = "Não foi possível concluir agora. Tente novamente."
)

// UserRepository guarda e busca contas.
type UserRepository interface {
	Create(ctx context.Context, user store.NewUser) (store.User, error)
	FindByEmail(ctx context.Context, email string) (store.User, error)
	FindByHandle(ctx context.Context, handle string) (store.User, error)
	FindByID(ctx context.Context, id int64) (store.User, error)
}

// TokenIssuer emite tokens de sessão.
type TokenIssuer interface {
	Issue(userID int64, ttl time.Duration) (string, auth.Claims, error)
}

// PasswordHasher gera e compara hashes de senha.
type PasswordHasher interface {
	Hash(password string) (string, error)
	Compare(hash, password string) error
	CompareDummy(password string)
}

// TokenRevoker invalida um token antes da expiração.
type TokenRevoker interface {
	Revoke(ctx context.Context, jti string, expiresAt time.Time) error
}

// Auth atende as rotas de autenticação.
type Auth struct {
	Users        UserRepository
	Tokens       TokenIssuer
	Hasher       PasswordHasher
	Revocations  TokenRevoker
	CookieSecure bool
	TTL          time.Duration
	RememberTTL  time.Duration
}

// SignupRequest é o corpo de POST /auth/signup.
type SignupRequest struct {
	Name     string `json:"name" example:"Maria Lima"`
	Email    string `json:"email" example:"maria@example.com"`
	Password string `json:"password" example:"senha-segura"`
	Remember bool   `json:"remember" example:"false"`
}

// LoginRequest é o corpo de POST /auth/login.
type LoginRequest struct {
	Identifier string `json:"identifier" example:"maria@example.com"`
	Password   string `json:"password" example:"senha-segura"`
	Remember   bool   `json:"remember" example:"false"`
}

// Viewer é a pessoa logada.
type Viewer struct {
	Handle    string  `json:"handle" example:"maria"`
	Name      string  `json:"name" example:"Maria Lima"`
	Initials  string  `json:"initials" example:"ML"`
	AvatarURL *string `json:"avatarUrl"`
}

// Signup cria a conta e abre a sessão.
//
//	@Summary	Cria uma conta e abre a sessão
//	@Tags		auth
//	@Accept		json
//	@Produce	json
//	@Param		body	body		SignupRequest	true	"Dados do cadastro"
//	@Success	201		{object}	Viewer
//	@Header		201		{string}	Set-Cookie	"cc_session: JWT httpOnly"
//	@Failure	400		{object}	apierror.Body
//	@Failure	409		{object}	apierror.Body
//	@Failure	413		{object}	apierror.Body
//	@Failure	422		{object}	apierror.Body
//	@Failure	500		{object}	apierror.Body
//	@Router		/auth/signup [post]
func (a Auth) Signup(c *gin.Context) {
	var request SignupRequest
	if !bindAuthBody(c, &request) {
		return
	}

	input := auth.SignupInput{Name: request.Name, Email: request.Email, Password: request.Password}
	if fields := auth.ValidateSignup(input); len(fields) > 0 {
		apierror.Respond(c, http.StatusUnprocessableEntity, apierror.CodeValidation, msgValidation, fields)
		return
	}

	hash, err := a.Hasher.Hash(request.Password)
	if err != nil {
		respondInternal(c, err)
		return
	}

	user, err := a.createUser(c.Request.Context(), store.NewUser{
		Name:         strings.TrimSpace(request.Name),
		Email:        auth.NormalizeEmail(request.Email),
		PasswordHash: hash,
	})
	switch {
	case errors.Is(err, store.ErrEmailTaken):
		apierror.Respond(c, http.StatusConflict, apierror.CodeConflict, msgEmailConflict,
			map[string]string{"email": auth.MsgEmailTaken})
		return
	case err != nil:
		respondInternal(c, err)
		return
	}

	a.openSession(c, http.StatusCreated, user, request.Remember)
}

// createUser insere a conta, trocando de handle enquanto houver colisão.
func (a Auth) createUser(ctx context.Context, user store.NewUser) (store.User, error) {
	email := user.Email
	for attempt := range sequentialHandleAttempts + randomHandleAttempts {
		suffix, err := handleSuffix(attempt)
		if err != nil {
			return store.User{}, err
		}
		user.Handle = auth.GenerateHandle(email, suffix)

		created, err := a.Users.Create(ctx, user)
		if errors.Is(err, store.ErrHandleTaken) {
			continue
		}
		return created, err
	}
	return store.User{}, fmt.Errorf("handles esgotados para a parte local do email: %w", store.ErrHandleTaken)
}

func handleSuffix(attempt int) (string, error) {
	switch {
	case attempt == 0:
		return "", nil
	case attempt < sequentialHandleAttempts:
		return strconv.Itoa(attempt + 1), nil
	}
	value, err := rand.Int(rand.Reader, big.NewInt(randomSuffixLimit))
	if err != nil {
		return "", fmt.Errorf("gerar sufixo: %w", err)
	}
	return fmt.Sprintf("%06d", value.Int64()), nil
}

// Login autentica por email ou handle e abre a sessão.
//
//	@Summary	Abre a sessão com email ou usuário e senha
//	@Tags		auth
//	@Accept		json
//	@Produce	json
//	@Param		body	body		LoginRequest	true	"Credenciais"
//	@Success	200		{object}	Viewer
//	@Header		200		{string}	Set-Cookie	"cc_session: JWT httpOnly"
//	@Failure	400		{object}	apierror.Body
//	@Failure	401		{object}	apierror.Body
//	@Failure	413		{object}	apierror.Body
//	@Failure	422		{object}	apierror.Body
//	@Failure	500		{object}	apierror.Body
//	@Router		/auth/login [post]
func (a Auth) Login(c *gin.Context) {
	var request LoginRequest
	if !bindAuthBody(c, &request) {
		return
	}

	if fields := auth.ValidateLogin(request.Identifier, request.Password); len(fields) > 0 {
		apierror.Respond(c, http.StatusUnprocessableEntity, apierror.CodeValidation, msgValidation, fields)
		return
	}

	user, err := a.findByIdentifier(c.Request.Context(), request.Identifier)
	if errors.Is(err, store.ErrNotFound) {
		a.Hasher.CompareDummy(request.Password)
		respondInvalidLogin(c)
		return
	}
	if err != nil {
		respondInternal(c, err)
		return
	}

	err = a.Hasher.Compare(user.PasswordHash, request.Password)
	if errors.Is(err, auth.ErrPasswordMismatch) {
		respondInvalidLogin(c)
		return
	}
	if err != nil {
		respondInternal(c, err)
		return
	}

	a.openSession(c, http.StatusOK, user, request.Remember)
}

func (a Auth) findByIdentifier(ctx context.Context, identifier string) (store.User, error) {
	normalized := auth.NormalizeEmail(identifier)
	if strings.Contains(normalized, "@") {
		return a.Users.FindByEmail(ctx, normalized)
	}
	return a.Users.FindByHandle(ctx, normalized)
}

// Logout invalida o token atual e apaga o cookie.
//
//	@Summary	Encerra a sessão e invalida o token
//	@Tags		auth
//	@Produce	json
//	@Security	CookieAuth
//	@Success	204
//	@Failure	401	{object}	apierror.Body
//	@Failure	500	{object}	apierror.Body
//	@Router		/auth/logout [post]
func (a Auth) Logout(c *gin.Context) {
	claims, ok := middleware.ClaimsFrom(c)
	if !ok {
		apierror.Respond(c, http.StatusUnauthorized, apierror.CodeUnauthenticated, msgUnauthenticated, nil)
		return
	}

	if err := a.Revocations.Revoke(c.Request.Context(), claims.JTI, claims.ExpiresAt); err != nil {
		respondInternal(c, err)
		return
	}

	a.setCookie(c, "", -1)
	c.Status(http.StatusNoContent)
}

// Me devolve a pessoa logada.
//
//	@Summary	Devolve a pessoa logada
//	@Tags		auth
//	@Produce	json
//	@Security	CookieAuth
//	@Success	200	{object}	Viewer
//	@Failure	401	{object}	apierror.Body
//	@Failure	500	{object}	apierror.Body
//	@Router		/auth/me [get]
func (a Auth) Me(c *gin.Context) {
	claims, ok := middleware.ClaimsFrom(c)
	if !ok {
		apierror.Respond(c, http.StatusUnauthorized, apierror.CodeUnauthenticated, msgUnauthenticated, nil)
		return
	}

	user, err := a.Users.FindByID(c.Request.Context(), claims.UserID)
	if errors.Is(err, store.ErrNotFound) {
		apierror.Respond(c, http.StatusUnauthorized, apierror.CodeUnauthenticated, msgUnauthenticated, nil)
		return
	}
	if err != nil {
		respondInternal(c, err)
		return
	}

	c.JSON(http.StatusOK, toViewer(user))
}

func (a Auth) openSession(c *gin.Context, status int, user store.User, remember bool) {
	ttl, maxAge := a.TTL, 0
	if remember {
		ttl, maxAge = a.RememberTTL, int(a.RememberTTL.Seconds())
	}

	token, _, err := a.Tokens.Issue(user.ID, ttl)
	if err != nil {
		respondInternal(c, err)
		return
	}

	a.setCookie(c, token, maxAge)
	c.JSON(status, toViewer(user))
}

func (a Auth) setCookie(c *gin.Context, value string, maxAge int) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     auth.CookieName,
		Value:    value,
		Path:     cookiePath,
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   a.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
}

func toViewer(user store.User) Viewer {
	return Viewer{
		Handle:    user.Handle,
		Name:      user.Name,
		Initials:  auth.Initials(user.Name),
		AvatarURL: user.AvatarURL,
	}
}

// bindAuthBody lê o JSON com tamanho limitado e já responde em caso de falha.
func bindAuthBody(c *gin.Context, target any) bool {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxAuthBodyBytes)
	err := c.ShouldBindJSON(target)
	if err == nil {
		return true
	}

	var tooLarge *http.MaxBytesError
	if errors.As(err, &tooLarge) {
		apierror.Respond(c, http.StatusRequestEntityTooLarge, apierror.CodeBodyTooLarge, msgBodyTooLarge, nil)
		return false
	}
	apierror.Respond(c, http.StatusBadRequest, apierror.CodeInvalidBody, msgInvalidBody, nil)
	return false
}

func respondInvalidLogin(c *gin.Context) {
	apierror.Respond(c, http.StatusUnauthorized, apierror.CodeInvalidLogin, msgInvalidLogin,
		map[string]string{"password": auth.MsgInvalidCredentials})
}

func respondInternal(c *gin.Context, err error) {
	_ = c.Error(err)
	apierror.Respond(c, http.StatusInternalServerError, apierror.CodeInternal, msgInternal, nil)
}
