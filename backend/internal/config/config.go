package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	CORSOrigins []string
}

func Load() Config {
	return Config{
		Port:        get("API_PORT", "8080"),
		DBHost:      get("DB_HOST", "mysql"),
		DBPort:      get("DB_PORT", "3306"),
		DBUser:      get("DB_USER", "app"),
		DBPassword:  get("DB_PASSWORD", "app"),
		DBName:      get("DB_NAME", "code_connect"),
		CORSOrigins: []string{get("CORS_ORIGIN", "http://localhost:5173")},
	}
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
