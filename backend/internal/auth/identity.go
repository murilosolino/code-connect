package auth

import (
	"strings"
	"unicode/utf8"
)

// MaxHandleLength é o tamanho máximo do @handle.
const MaxHandleLength = 30

const (
	fallbackHandle  = "usuario"
	maxSuffixDigits = 10
	missingInitials = "?"
)

// NormalizeEmail é a forma canônica com que o email é guardado e buscado.
func NormalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

// GenerateHandle deriva o @handle da parte local do email: minúsculo, só [a-z0-9._], sem pontos
// repetidos ou nas pontas. suffix (só dígitos são usados) resolve colisões.
func GenerateHandle(email, suffix string) string {
	local := email
	if at := strings.LastIndexByte(email, '@'); at >= 0 {
		local = email[:at]
	}

	base := strings.Trim(sanitizeHandle(local), ".")
	if base == "" {
		base = fallbackHandle
	}

	digits := onlyDigits(suffix)
	if room := MaxHandleLength - len(digits); len(base) > room {
		base = strings.TrimRight(base[:room], ".")
	}
	return base + digits
}

func sanitizeHandle(value string) string {
	var out strings.Builder
	var previous byte
	for i := 0; i < len(value); i++ {
		c := value[i]
		if c >= 'A' && c <= 'Z' {
			c += 'a' - 'A'
		}
		valid := (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '.' || c == '_'
		if !valid || (c == '.' && previous == '.') {
			continue
		}
		out.WriteByte(c)
		previous = c
	}
	return out.String()
}

func onlyDigits(value string) string {
	var out strings.Builder
	for i := 0; i < len(value) && out.Len() < maxSuffixDigits; i++ {
		if value[i] >= '0' && value[i] <= '9' {
			out.WriteByte(value[i])
		}
	}
	return out.String()
}

// Initials devolve as letras do avatar: a primeira do primeiro e do último nome.
func Initials(name string) string {
	words := strings.Fields(name)
	if len(words) == 0 {
		return missingInitials
	}
	initials := firstLetter(words[0])
	if len(words) > 1 {
		initials += firstLetter(words[len(words)-1])
	}
	return strings.ToUpper(initials)
}

func firstLetter(word string) string {
	r, _ := utf8.DecodeRuneInString(word)
	return string(r)
}
