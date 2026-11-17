// Package integration exercita a API real (router.New) contra o MySQL do Compose.
package integration

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/code-connect/backend/internal/config"
	"github.com/code-connect/backend/internal/database"
	"github.com/code-connect/backend/internal/router"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
)

var testDB *sql.DB

func TestMain(m *testing.M) {
	os.Exit(run(m))
}

// run cria um database exclusivo deste processo e o apaga no fim, sem tocar nos dados de dev.
func run(m *testing.M) int {
	adminDSN := os.Getenv("TEST_DB_DSN")
	if adminDSN == "" {
		fmt.Fprintln(os.Stderr, "TEST_DB_DSN não definido: rode os testes pelo container (make backend-test).")
		return 1
	}

	parsed, err := mysql.ParseDSN(adminDSN)
	if err != nil {
		fmt.Fprintf(os.Stderr, "TEST_DB_DSN inválido: %v\n", err)
		return 1
	}

	admin, err := database.Connect(parsed.FormatDSN())
	if err != nil {
		fmt.Fprintf(os.Stderr, "conectar: %v\n", err)
		return 1
	}
	defer admin.Close()

	suffix := make([]byte, 6)
	if _, err := rand.Read(suffix); err != nil {
		fmt.Fprintf(os.Stderr, "sufixo: %v\n", err)
		return 1
	}
	name := "code_connect_test_" + hex.EncodeToString(suffix)
	if _, err := admin.Exec("CREATE DATABASE `" + name + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"); err != nil {
		fmt.Fprintf(os.Stderr, "criar database: %v\n", err)
		return 1
	}
	defer admin.Exec("DROP DATABASE `" + name + "`")

	parsed.DBName = name
	testDB, err = database.Connect(parsed.FormatDSN())
	if err != nil {
		fmt.Fprintf(os.Stderr, "conectar ao database de teste: %v\n", err)
		return 1
	}
	defer testDB.Close()

	if err := database.Migrate(context.Background(), testDB); err != nil {
		fmt.Fprintf(os.Stderr, "migrar: %v\n", err)
		return 1
	}

	gin.SetMode(gin.TestMode)
	return m.Run()
}

const testSecret = "0123456789abcdef0123456789abcdef"

func testConfig() config.Config {
	return config.Config{
		CORSOrigins:    []string{"http://localhost:5173"},
		JWTSecret:      testSecret,
		JWTTTL:         time.Hour,
		JWTRememberTTL: 48 * time.Hour,
		CookieSecure:   false,
		BcryptCost:     4,
	}
}

// newAPI limpa as tabelas e devolve a API real.
func newAPI(t *testing.T) http.Handler {
	t.Helper()
	for _, table := range []string{"revoked_tokens", "users"} {
		if _, err := testDB.Exec("TRUNCATE TABLE " + table); err != nil {
			t.Fatal(err)
		}
	}
	return router.New(testConfig(), testDB)
}

func send(api http.Handler, method, path, body string, cookies ...*http.Cookie) *httptest.ResponseRecorder {
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	for _, cookie := range cookies {
		request.AddCookie(cookie)
	}
	recorder := httptest.NewRecorder()
	api.ServeHTTP(recorder, request)
	return recorder
}
