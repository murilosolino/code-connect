package auth

import (
	"regexp"
	"strings"
	"unicode"
	"unicode/utf8"
)

const (
	MaxNameRunes     = 120
	MaxEmailBytes    = 254
	MinPasswordRunes = 8
	MaxPasswordBytes = 72 // limite do bcrypt
)

// Mensagens exibidas nos formulários.
const (
	MsgNameRequired       = "Informe seu nome."
	MsgNameInvalid        = "Digite um nome válido."
	MsgNameTooLong        = "Use um nome de até 120 caracteres."
	MsgEmailRequired      = "Informe seu email."
	MsgEmailInvalid       = "Digite um email válido."
	MsgEmailTaken         = "Este email já está em uso."
	MsgPasswordRequired   = "Informe sua senha."
	MsgPasswordTooShort   = "Use ao menos 8 caracteres."
	MsgPasswordTooLong    = "Use uma senha mais curta."
	MsgIdentifierRequired = "Informe seu email ou usuário."
	MsgInvalidCredentials = "Email, usuário ou senha incorretos."
)

var emailPattern = regexp.MustCompile(`^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]+$`)

// SignupInput são os campos do formulário de cadastro.
type SignupInput struct {
	Name     string
	Email    string
	Password string
}

// ValidateSignup devolve a mensagem de cada campo inválido; vazio significa válido.
func ValidateSignup(input SignupInput) map[string]string {
	errors := map[string]string{}
	if message := validateName(input.Name); message != "" {
		errors["name"] = message
	}
	if message := validateEmail(input.Email); message != "" {
		errors["email"] = message
	}
	if message := validateNewPassword(input.Password); message != "" {
		errors["password"] = message
	}
	return errors
}

// ValidateLogin só exige os campos preenchidos: regras de senha valem no cadastro.
func ValidateLogin(identifier, password string) map[string]string {
	errors := map[string]string{}
	if strings.TrimSpace(identifier) == "" {
		errors["identifier"] = MsgIdentifierRequired
	}
	if strings.TrimSpace(password) == "" {
		errors["password"] = MsgPasswordRequired
	}
	return errors
}

func validateName(name string) string {
	trimmed := strings.TrimSpace(name)
	switch {
	case trimmed == "":
		return MsgNameRequired
	case !utf8.ValidString(trimmed) || strings.IndexFunc(trimmed, unicode.IsControl) >= 0:
		return MsgNameInvalid
	case utf8.RuneCountInString(trimmed) > MaxNameRunes:
		return MsgNameTooLong
	}
	return ""
}

func validateEmail(email string) string {
	normalized := NormalizeEmail(email)
	switch {
	case normalized == "":
		return MsgEmailRequired
	case len(normalized) > MaxEmailBytes || !utf8.ValidString(normalized) || !emailPattern.MatchString(normalized):
		return MsgEmailInvalid
	}
	return ""
}

func validateNewPassword(password string) string {
	switch {
	case strings.TrimSpace(password) == "":
		return MsgPasswordRequired
	case utf8.RuneCountInString(password) < MinPasswordRunes:
		return MsgPasswordTooShort
	case len(password) > MaxPasswordBytes:
		return MsgPasswordTooLong
	}
	return ""
}
