package main

import (
	"context"
	"log"

	"github.com/code-connect/backend/internal/config"
	"github.com/code-connect/backend/internal/database"
	"github.com/code-connect/backend/internal/router"
)

// @title						CodeConnect API
// @version					1.0
// @description				API da rede CodeConnect. A sessão é um JWT em cookie httpOnly.
// @BasePath					/api
// @securityDefinitions.apikey	CookieAuth
// @in							cookie
// @name						cc_session
func main() {
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatal(err)
	}

	db, err := database.Connect(cfg.DSN())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := database.Migrate(context.Background(), db); err != nil {
		log.Fatal(err)
	}

	if err := router.New(cfg, db).Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
