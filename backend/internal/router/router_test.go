package router

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"

	"github.com/code-connect/backend/docs"
	"github.com/code-connect/backend/internal/config"
	"github.com/gin-gonic/gin"
)

var pathParam = regexp.MustCompile(`:(\w+)`)

func testConfig(swagger bool) config.Config {
	return config.Config{
		CORSOrigins:    []string{"http://localhost:5173"},
		JWTSecret:      "0123456789abcdef0123456789abcdef",
		JWTTTL:         1,
		JWTRememberTTL: 1,
		BcryptCost:     4,
		SwaggerEnabled: swagger,
	}
}

func get(t *testing.T, engine *gin.Engine, path string) *httptest.ResponseRecorder {
	t.Helper()
	recorder := httptest.NewRecorder()
	engine.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, path, nil))
	return recorder
}

func TestSwaggerDisabledByDefault(t *testing.T) {
	gin.SetMode(gin.TestMode)
	if recorder := get(t, New(testConfig(false), nil), "/api/docs/index.html"); recorder.Code != http.StatusNotFound {
		t.Fatalf("status = %d", recorder.Code)
	}
}

func TestSwaggerServedWhenEnabled(t *testing.T) {
	gin.SetMode(gin.TestMode)
	engine := New(testConfig(true), nil)

	if recorder := get(t, engine, "/api/docs/index.html"); recorder.Code != http.StatusOK {
		t.Fatalf("index: status = %d", recorder.Code)
	}
	recorder := get(t, engine, "/api/docs/doc.json")
	if recorder.Code != http.StatusOK || !json.Valid(recorder.Body.Bytes()) {
		t.Fatalf("doc.json: status = %d", recorder.Code)
	}
}

// Toda rota da API precisa estar no Swagger: `make swagger` depois de mudar uma rota.
func TestEveryRouteIsDocumented(t *testing.T) {
	gin.SetMode(gin.TestMode)

	var spec struct {
		BasePath string                    `json:"basePath"`
		Paths    map[string]map[string]any `json:"paths"`
	}
	if err := json.Unmarshal([]byte(docs.SwaggerInfo.ReadDoc()), &spec); err != nil {
		t.Fatal(err)
	}

	routes := New(testConfig(false), nil).Routes()
	if len(routes) == 0 {
		t.Fatal("nenhuma rota registrada")
	}
	for _, route := range routes {
		if !strings.HasPrefix(route.Path, spec.BasePath+"/") {
			t.Errorf("rota fora de %s: %s", spec.BasePath, route.Path)
			continue
		}
		path := strings.TrimPrefix(route.Path, spec.BasePath)
		path = pathParam.ReplaceAllString(path, "{$1}")
		if _, documented := spec.Paths[path][strings.ToLower(route.Method)]; !documented {
			t.Errorf("rota sem documentação: %s %s", route.Method, route.Path)
		}
	}
}
