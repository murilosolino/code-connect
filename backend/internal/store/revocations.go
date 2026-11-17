package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

const purgeBatchSize = 100

// Revocations guarda os tokens invalidados por logout até expirarem.
type Revocations struct {
	DB *sql.DB
}

// Revoke registra o token e aproveita para apagar um lote de registros já expirados.
func (s Revocations) Revoke(ctx context.Context, jti string, expiresAt time.Time) error {
	if _, err := s.DB.ExecContext(ctx,
		"INSERT IGNORE INTO revoked_tokens (jti, expires_at) VALUES (?, ?)", jti, expiresAt.UTC()); err != nil {
		return fmt.Errorf("revogar token: %w", err)
	}

	// Limpeza oportunista: se falhar, o token já foi revogado e a próxima chamada tenta de novo.
	_, _ = s.DB.ExecContext(ctx, "DELETE FROM revoked_tokens WHERE expires_at < UTC_TIMESTAMP() LIMIT ?", purgeBatchSize)
	return nil
}

// IsRevoked informa se o token foi invalidado.
func (s Revocations) IsRevoked(ctx context.Context, jti string) (bool, error) {
	var found int
	err := s.DB.QueryRowContext(ctx, "SELECT 1 FROM revoked_tokens WHERE jti = ?", jti).Scan(&found)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("consultar revogação: %w", err)
	}
	return true, nil
}
