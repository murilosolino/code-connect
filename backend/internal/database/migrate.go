package database

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"sort"
)

const (
	migrationsDir       = "migrations"
	migrationLockName   = "code_connect_migrations"
	migrationLockSecond = 30
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

// Migrate aplica, em ordem de nome, as migrações ainda não registradas em schema_migrations.
// Cada arquivo tem um único comando: DDL no MySQL não é transacional e o driver não aceita
// múltiplos comandos por padrão.
func Migrate(ctx context.Context, db *sql.DB) (err error) {
	// GET_LOCK vale por conexão, então tudo roda na mesma.
	conn, err := db.Conn(ctx)
	if err != nil {
		return fmt.Errorf("abrir conexão: %w", err)
	}
	defer conn.Close()

	var locked sql.NullInt64
	if err := conn.QueryRowContext(ctx, "SELECT GET_LOCK(?, ?)", migrationLockName, migrationLockSecond).Scan(&locked); err != nil {
		return fmt.Errorf("obter lock: %w", err)
	}
	if locked.Int64 != 1 {
		return errors.New("outra instância está aplicando as migrações")
	}
	defer func() {
		var released sql.NullInt64
		if releaseErr := conn.QueryRowContext(ctx, "SELECT RELEASE_LOCK(?)", migrationLockName).Scan(&released); releaseErr != nil && err == nil {
			err = fmt.Errorf("liberar lock: %w", releaseErr)
		}
	}()

	if _, err := conn.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (
		version VARCHAR(255) NOT NULL PRIMARY KEY,
		applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
	)`); err != nil {
		return fmt.Errorf("criar schema_migrations: %w", err)
	}

	names, err := fs.Glob(migrationFiles, migrationsDir+"/*.sql")
	if err != nil {
		return fmt.Errorf("listar migrações: %w", err)
	}
	sort.Strings(names)

	for _, name := range names {
		if err := applyMigration(ctx, conn, name); err != nil {
			return fmt.Errorf("migração %s: %w", name, err)
		}
	}
	return nil
}

func applyMigration(ctx context.Context, conn *sql.Conn, name string) error {
	var applied int
	if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM schema_migrations WHERE version = ?", name).Scan(&applied); err != nil {
		return err
	}
	if applied > 0 {
		return nil
	}

	statement, err := migrationFiles.ReadFile(name)
	if err != nil {
		return err
	}
	if _, err := conn.ExecContext(ctx, string(statement)); err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, "INSERT INTO schema_migrations (version) VALUES (?)", name)
	return err
}
