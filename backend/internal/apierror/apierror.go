// Package apierror define o corpo único de erro da API.
package apierror

import "github.com/gin-gonic/gin"

const (
	CodeInvalidBody     = "invalid_body"
	CodeBodyTooLarge    = "body_too_large"
	CodeValidation      = "validation_failed"
	CodeConflict        = "conflict"
	CodeInvalidLogin    = "invalid_credentials"
	CodeUnauthenticated = "unauthenticated"
	CodeInternal        = "internal_error"
)

// Detail é o conteúdo do erro; Fields leva as mensagens por campo de formulário.
type Detail struct {
	Code    string            `json:"code" example:"validation_failed"`
	Message string            `json:"message" example:"Confira os campos destacados."`
	Fields  map[string]string `json:"fields,omitempty"`
}

// Body é o corpo de toda resposta de erro.
type Body struct {
	Error Detail `json:"error"`
}

// Respond grava o erro e interrompe a cadeia de handlers.
func Respond(c *gin.Context, status int, code, message string, fields map[string]string) {
	c.AbortWithStatusJSON(status, Body{Error: Detail{Code: code, Message: message, Fields: fields}})
}
