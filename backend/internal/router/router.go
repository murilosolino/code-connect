package router

import (
	"database/sql"

	"github.com/code-connect/backend/internal/config"
	"github.com/code-connect/backend/internal/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func New(cfg config.Config, db *sql.DB) *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: cfg.CORSOrigins,
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	api := r.Group("/api")
	{
		api.GET("/health", handlers.Health{DB: db}.Check)
	}
	return r
}
