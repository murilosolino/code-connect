package main

import (
	"log"

	"github.com/code-connect/backend/internal/config"
	"github.com/code-connect/backend/internal/database"
	"github.com/code-connect/backend/internal/router"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DSN())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := router.New(cfg, db).Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
