package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"
)

const (
	minJWTSecretBytes = 32
	minBcryptCost     = 4
	maxBcryptCost     = 31
)

type Config struct {
	Port           string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	CORSOrigins    []string
	JWTSecret      string
	JWTTTL         time.Duration
	JWTRememberTTL time.Duration
	CookieSecure   bool
	BcryptCost     int
	SwaggerEnabled bool
}

func Load() Config {
	return Config{
		Port:           get("API_PORT", "8080"),
		DBHost:         get("DB_HOST", "mysql"),
		DBPort:         get("DB_PORT", "3306"),
		DBUser:         get("DB_USER", "app"),
		DBPassword:     get("DB_PASSWORD", "app"),
		DBName:         get("DB_NAME", "code_connect"),
		CORSOrigins:    []string{get("CORS_ORIGIN", "http://localhost:5173")},
		JWTSecret:      get("JWT_SECRET", ""),
		JWTTTL:         getDuration("JWT_TTL", 24*time.Hour),
		JWTRememberTTL: getDuration("JWT_REMEMBER_TTL", 720*time.Hour),
		CookieSecure:   getBool("COOKIE_SECURE", true),
		BcryptCost:     getInt("BCRYPT_COST", 12),
		SwaggerEnabled: getBool("SWAGGER_ENABLED", false),
	}
}

// Validate recusa configurações inseguras; a API não deve subir com elas.
func (c Config) Validate() error {
	var problems []error
	if len(c.JWTSecret) < minJWTSecretBytes {
		problems = append(problems, fmt.Errorf("JWT_SECRET precisa ter ao menos %d bytes", minJWTSecretBytes))
	}
	if c.JWTTTL <= 0 {
		problems = append(problems, errors.New("JWT_TTL precisa ser positivo"))
	}
	if c.JWTRememberTTL <= 0 {
		problems = append(problems, errors.New("JWT_REMEMBER_TTL precisa ser positivo"))
	}
	if c.BcryptCost < minBcryptCost || c.BcryptCost > maxBcryptCost {
		problems = append(problems, fmt.Errorf("BCRYPT_COST precisa estar entre %d e %d", minBcryptCost, maxBcryptCost))
	}
	return errors.Join(problems...)
}

func (c Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4&loc=UTC",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

func get(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getDuration(key string, fallback time.Duration) time.Duration {
	v, err := time.ParseDuration(os.Getenv(key))
	if err != nil {
		return fallback
	}
	return v
}

func getBool(key string, fallback bool) bool {
	v, err := strconv.ParseBool(os.Getenv(key))
	if err != nil {
		return fallback
	}
	return v
}

func getInt(key string, fallback int) int {
	v, err := strconv.Atoi(os.Getenv(key))
	if err != nil {
		return fallback
	}
	return v
}
