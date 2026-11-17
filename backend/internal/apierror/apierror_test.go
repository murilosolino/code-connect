package apierror

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func respond(t *testing.T, fields map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	Respond(ctx, http.StatusUnprocessableEntity, CodeValidation, "Confira os campos.", fields)
	if !ctx.IsAborted() {
		t.Error("a resposta de erro deve abortar a cadeia de handlers")
	}
	return recorder
}

func TestRespondWritesConsistentBody(t *testing.T) {
	recorder := respond(t, map[string]string{"email": "Digite um email válido."})

	if recorder.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d", recorder.Code)
	}
	var body Body
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Error.Code != CodeValidation || body.Error.Message != "Confira os campos." {
		t.Errorf("corpo = %+v", body)
	}
	if body.Error.Fields["email"] != "Digite um email válido." {
		t.Errorf("fields = %+v", body.Error.Fields)
	}
}

func TestRespondOmitsEmptyFields(t *testing.T) {
	recorder := respond(t, nil)

	var raw map[string]map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &raw); err != nil {
		t.Fatal(err)
	}
	if _, present := raw["error"]["fields"]; present {
		t.Error("fields deve ser omitido quando vazio")
	}
}
