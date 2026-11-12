package auth

import (
	"regexp"
	"strings"
	"testing"
	"unicode/utf8"
)

var handlePattern = regexp.MustCompile(`^[a-z0-9_]([a-z0-9._]*[a-z0-9_])?$`)

func TestNormalizeEmail(t *testing.T) {
	if got := NormalizeEmail("  Ana.Souza@Example.COM "); got != "ana.souza@example.com" {
		t.Fatalf("got %q", got)
	}
}

func TestGenerateHandle(t *testing.T) {
	tests := []struct {
		name, email, suffix, want string
	}{
		{"local simples", "maria@x.com", "", "maria"},
		{"maiúsculas e pontos", "Ana.Souza@x.com", "", "ana.souza"},
		{"remove inválidos", "jo+ao-1@x.com", "", "joao1"},
		{"sublinhado", "rafa_dev@x.com", "", "rafa_dev"},
		{"pontos nas pontas", ".bia.@x.com", "", "bia"},
		{"pontos repetidos", "a..b@x.com", "", "a.b"},
		{"com sufixo", "maria@x.com", "2", "maria2"},
		{"só inválidos", "+++@x.com", "", "usuario"},
		{"sem arroba", "semarroba", "", "semarroba"},
		{"corta no máximo", strings.Repeat("a", 40) + "@x.com", "", strings.Repeat("a", MaxHandleLength)},
		{"corta abrindo espaço ao sufixo", strings.Repeat("a", 40) + "@x.com", "123456", strings.Repeat("a", MaxHandleLength-6) + "123456"},
		{"não termina em ponto após cortar", strings.Repeat("a", 29) + ".b@x.com", "", strings.Repeat("a", 29)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := GenerateHandle(tt.email, tt.suffix); got != tt.want {
				t.Fatalf("got %q, want %q", got, tt.want)
			}
		})
	}
}

func TestInitials(t *testing.T) {
	tests := map[string]string{
		"Júlio Oliveira":       "JO",
		"Ana":                  "A",
		"ana maria souza":      "AS",
		"  bia   lima  ":       "BL",
		"Émile Zola":           "ÉZ",
		"":                     "?",
		"   ":                  "?",
		"日本 語":                 "日語",
		"\xff\xfe nome válido": "�V",
	}
	for name, want := range tests {
		if got := Initials(name); got != want {
			t.Errorf("Initials(%q) = %q, want %q", name, got, want)
		}
	}
}

func FuzzGenerateHandle(f *testing.F) {
	for _, seed := range []string{"maria@x.com", "", "@", "...@x", "ÁÉÍ@x.com", strings.Repeat("z", 500), "a\x00b@x", "%27--@x"} {
		f.Add(seed, "")
		f.Add(seed, "12")
	}

	f.Fuzz(func(t *testing.T, email, suffix string) {
		handle := GenerateHandle(email, suffix)
		if len(handle) > MaxHandleLength {
			t.Fatalf("handle longo demais: %q", handle)
		}
		if !handlePattern.MatchString(handle) {
			t.Fatalf("handle fora do padrão: %q (email %q, sufixo %q)", handle, email, suffix)
		}
		if strings.Contains(handle, "..") {
			t.Fatalf("pontos repetidos: %q", handle)
		}
	})
}

func FuzzInitials(f *testing.F) {
	for _, seed := range []string{"Júlio Oliveira", "", " ", "\xff", "a\tb\nc", "😀 😀", "ß ß"} {
		f.Add(seed)
	}

	f.Fuzz(func(t *testing.T, name string) {
		initials := Initials(name)
		if count := utf8.RuneCountInString(initials); count < 1 || count > 2 {
			t.Fatalf("Initials(%q) = %q (%d runas)", name, initials, count)
		}
		if !utf8.ValidString(initials) {
			t.Fatalf("Initials(%q) não é UTF-8 válido: %q", name, initials)
		}
	})
}

func BenchmarkGenerateHandle(b *testing.B) {
	b.ReportAllocs()
	for b.Loop() {
		GenerateHandle("Ana.Souza+teste@example.com", "2")
	}
}
