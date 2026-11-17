package router

import (
	"database/sql"

	_ "github.com/code-connect/backend/docs" // registra o documento do Swagger
	"github.com/code-connect/backend/internal/auth"
	"github.com/code-connect/backend/internal/config"
	"github.com/code-connect/backend/internal/handlers"
	"github.com/code-connect/backend/internal/middleware"
	"github.com/code-connect/backend/internal/store"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func New(cfg config.Config, db *sql.DB) *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: cfg.CORSOrigins,
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	tokens := auth.NewTokenManager(cfg.JWTSecret)
	revocations := store.Revocations{DB: db}
	session := middleware.RequireSession(tokens, revocations)
	authentication := handlers.Auth{
		Users:        store.Users{DB: db},
		Tokens:       tokens,
		Hasher:       auth.NewHasher(cfg.BcryptCost),
		Revocations:  revocations,
		CookieSecure: cfg.CookieSecure,
		TTL:          cfg.JWTTTL,
		RememberTTL:  cfg.JWTRememberTTL,
	}

	api := r.Group("/api")
	{
		api.GET("/health", handlers.Health{DB: db}.Check)

		api.POST("/auth/signup", authentication.Signup)
		api.POST("/auth/login", authentication.Login)
		api.POST("/auth/logout", session, authentication.Logout)
		api.GET("/auth/me", session, authentication.Me)

		if cfg.SwaggerEnabled {
			api.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
		}
	}
	return r
}
