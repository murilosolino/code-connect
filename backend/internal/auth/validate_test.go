package auth

import (
	"strings"
	"testing"
	"unicode/utf8"
)

func TestValidateSignup(t *testing.T) {
	valid := SignupInput{Name: "Maria Lima", Email: "maria@x.com", Password: "senha-segura"}

	tests := []struct {
		name   string
		mutate func(*SignupInput)
		field  string
		want   string
	}{
		{"válido", func(*SignupInput) {}, "", ""},
		{"nome vazio", func(i *SignupInput) { i.Name = "   " }, "name", MsgNameRequired},
		{"nome longo", func(i *SignupInput) { i.Name = strings.Repeat("a", MaxNameRunes+1) }, "name", MsgNameTooLong},
		{"nome com controle", func(i *SignupInput) { i.Name = "Ma\x00ria" }, "name", MsgNameInvalid},
		{"email vazio", func(i *SignupInput) { i.Email = "" }, "email", MsgEmailRequired},
		{"email sem arroba", func(i *SignupInput) { i.Email = "maria" }, "email", MsgEmailInvalid},
		{"email sem ponto", func(i *SignupInput) { i.Email = "maria@x" }, "email", MsgEmailInvalid},
		{"email com espaço", func(i *SignupInput) { i.Email = "ma ria@x.com" }, "email", MsgEmailInvalid},
		{"email com controle", func(i *SignupInput) { i.Email = "ma\x01ria@x.com" }, "email", MsgEmailInvalid},
		{"email longo", func(i *SignupInput) { i.Email = strings.Repeat("a", MaxEmailBytes) + "@x.com" }, "email", MsgEmailInvalid},
		{"senha vazia", func(i *SignupInput) { i.Password = "  " }, "password", MsgPasswordRequired},
		{"senha curta", func(i *SignupInput) { i.Password = "1234567" }, "password", MsgPasswordTooShort},
		{"senha longa", func(i *SignupInput) { i.Password = strings.Repeat("a", MaxPasswordBytes+1) }, "password", MsgPasswordTooLong},
		{"senha acentuada no limite de bytes", func(i *SignupInput) { i.Password = strings.Repeat("é", 37) }, "password", MsgPasswordTooLong},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := valid
			tt.mutate(&input)
			errors := ValidateSignup(input)
			if tt.field == "" {
				if len(errors) != 0 {
					t.Fatalf("erros inesperados: %v", errors)
				}
				return
			}
			if errors[tt.field] != tt.want || len(errors) != 1 {
				t.Fatalf("erros = %v, queria só %s=%q", errors, tt.field, tt.want)
			}
		})
	}
}

func TestValidateSignupReportsEveryField(t *testing.T) {
	errors := ValidateSignup(SignupInput{})
	if len(errors) != 3 {
		t.Fatalf("erros = %v", errors)
	}
}

func TestValidateSignupAcceptsSurroundingSpaces(t *testing.T) {
	if errors := ValidateSignup(SignupInput{Name: " Maria ", Email: " maria@x.com ", Password: "senha-segura"}); len(errors) != 0 {
		t.Fatalf("erros = %v", errors)
	}
}

func TestValidateLogin(t *testing.T) {
	if errors := ValidateLogin("maria", "x"); len(errors) != 0 {
		t.Fatalf("login não aplica regra de tamanho de senha: %v", errors)
	}
	errors := ValidateLogin(" ", " ")
	if errors["identifier"] != MsgIdentifierRequired || errors["password"] != MsgPasswordRequired {
		t.Fatalf("erros = %v", errors)
	}
}

func FuzzValidateSignup(f *testing.F) {
	f.Add("Maria", "maria@x.com", "senha-segura")
	f.Add("", "", "")
	f.Add("\x00", "@", "\xff")
	f.Add(strings.Repeat("ã", 500), strings.Repeat("a@", 300), strings.Repeat("é", 100))

	f.Fuzz(func(t *testing.T, name, email, password string) {
		errors := ValidateSignup(SignupInput{Name: name, Email: email, Password: password})
		for field := range errors {
			if field != "name" && field != "email" && field != "password" {
				t.Fatalf("campo inesperado: %q", field)
			}
		}
		if len(errors) != 0 {
			return
		}
		// O que passa na validação precisa caber nas regras do bcrypt e do banco.
		trimmed := strings.TrimSpace(name)
		if trimmed == "" || utf8.RuneCountInString(trimmed) > MaxNameRunes {
			t.Fatalf("nome inválido aceito: %q", name)
		}
		if len(password) > MaxPasswordBytes || utf8.RuneCountInString(password) < MinPasswordRunes {
			t.Fatalf("senha inválida aceita (%d bytes)", len(password))
		}
		normalized := NormalizeEmail(email)
		if len(normalized) > MaxEmailBytes || !strings.Contains(normalized, "@") || !utf8.ValidString(normalized) {
			t.Fatalf("email inválido aceito: %q", email)
		}
	})
}

func BenchmarkValidateSignup(b *testing.B) {
	input := SignupInput{Name: "Maria Lima", Email: "maria@example.com", Password: "senha-segura"}
	b.ReportAllocs()
	for b.Loop() {
		ValidateSignup(input)
	}
}
