package config

import (
	"strings"
	"testing"
	"time"
)

const validSecret = "0123456789abcdef0123456789abcdef"

func TestLoadUsesSafeDefaults(t *testing.T) {
	for _, key := range []string{"JWT_SECRET", "JWT_TTL", "JWT_REMEMBER_TTL", "BCRYPT_COST", "COOKIE_SECURE", "SWAGGER_ENABLED"} {
		t.Setenv(key, "")
	}

	cfg := Load()

	if cfg.JWTSecret != "" {
		t.Errorf("JWTSecret não deve ter default, veio %q", cfg.JWTSecret)
	}
	if cfg.JWTTTL != 24*time.Hour {
		t.Errorf("JWTTTL = %v", cfg.JWTTTL)
	}
	if cfg.JWTRememberTTL != 720*time.Hour {
		t.Errorf("JWTRememberTTL = %v", cfg.JWTRememberTTL)
	}
	if !cfg.CookieSecure {
		t.Error("CookieSecure deve ser true por padrão")
	}
	if cfg.BcryptCost != 12 {
		t.Errorf("BcryptCost = %d", cfg.BcryptCost)
	}
	if cfg.SwaggerEnabled {
		t.Error("SwaggerEnabled deve ser false por padrão")
	}
}

func TestLoadReadsEnvironment(t *testing.T) {
	t.Setenv("JWT_SECRET", validSecret)
	t.Setenv("JWT_TTL", "1h")
	t.Setenv("JWT_REMEMBER_TTL", "48h")
	t.Setenv("BCRYPT_COST", "10")
	t.Setenv("COOKIE_SECURE", "false")
	t.Setenv("SWAGGER_ENABLED", "true")

	cfg := Load()

	if cfg.JWTSecret != validSecret || cfg.JWTTTL != time.Hour || cfg.JWTRememberTTL != 48*time.Hour {
		t.Errorf("valores de JWT incorretos: %+v", cfg)
	}
	if cfg.BcryptCost != 10 || cfg.CookieSecure || !cfg.SwaggerEnabled {
		t.Errorf("valores incorretos: %+v", cfg)
	}
}

func TestLoadFallsBackOnInvalidValues(t *testing.T) {
	t.Setenv("JWT_TTL", "amanhã")
	t.Setenv("BCRYPT_COST", "alto")
	t.Setenv("COOKIE_SECURE", "talvez")
	t.Setenv("SWAGGER_ENABLED", "talvez")

	cfg := Load()

	if cfg.JWTTTL != 24*time.Hour || cfg.BcryptCost != 12 {
		t.Errorf("valores inválidos devem cair no default: %+v", cfg)
	}
	if !cfg.CookieSecure || cfg.SwaggerEnabled {
		t.Errorf("booleanos inválidos devem cair no default seguro: %+v", cfg)
	}
}

func TestValidate(t *testing.T) {
	valid := Config{JWTSecret: validSecret, JWTTTL: time.Hour, JWTRememberTTL: time.Hour, BcryptCost: 12}

	tests := []struct {
		name    string
		mutate  func(*Config)
		wantErr string
	}{
		{name: "válida", mutate: func(*Config) {}},
		{name: "sem segredo", mutate: func(c *Config) { c.JWTSecret = "" }, wantErr: "JWT_SECRET"},
		{name: "segredo curto", mutate: func(c *Config) { c.JWTSecret = strings.Repeat("a", 31) }, wantErr: "JWT_SECRET"},
		{name: "ttl zero", mutate: func(c *Config) { c.JWTTTL = 0 }, wantErr: "JWT_TTL"},
		{name: "remember negativo", mutate: func(c *Config) { c.JWTRememberTTL = -time.Hour }, wantErr: "JWT_REMEMBER_TTL"},
		{name: "custo baixo", mutate: func(c *Config) { c.BcryptCost = 3 }, wantErr: "BCRYPT_COST"},
		{name: "custo alto", mutate: func(c *Config) { c.BcryptCost = 32 }, wantErr: "BCRYPT_COST"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cfg := valid
			tt.mutate(&cfg)
			err := cfg.Validate()
			if tt.wantErr == "" {
				if err != nil {
					t.Fatalf("erro inesperado: %v", err)
				}
				return
			}
			if err == nil || !strings.Contains(err.Error(), tt.wantErr) {
				t.Fatalf("erro = %v, queria menção a %s", err, tt.wantErr)
			}
		})
	}
}
