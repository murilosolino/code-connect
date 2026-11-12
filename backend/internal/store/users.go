// Package store concentra o acesso ao MySQL.
package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/go-sql-driver/mysql"
)

var (
	ErrNotFound    = errors.New("registro não encontrado")
	ErrEmailTaken  = errors.New("email já cadastrado")
	ErrHandleTaken = errors.New("handle já cadastrado")
)

const (
	mysqlDuplicateEntry = 1062
	userColumns         = "id, handle, name, email, password_hash, avatar_url"
)

// NewUser são os dados de uma conta a ser criada.
type NewUser struct {
	Handle       string
	Name         string
	Email        string
	PasswordHash string
}

// User é uma conta salva.
type User struct {
	ID           int64
	Handle       string
	Name         string
	Email        string
	PasswordHash string
	AvatarURL    *string
}

// Users é o repositório de contas.
type Users struct {
	DB *sql.DB
}

// Create insere a conta. Devolve ErrEmailTaken ou ErrHandleTaken em caso de duplicidade.
func (s Users) Create(ctx context.Context, user NewUser) (User, error) {
	result, err := s.DB.ExecContext(ctx,
		"INSERT INTO users (handle, name, email, password_hash) VALUES (?, ?, ?, ?)",
		user.Handle, user.Name, user.Email, user.PasswordHash)
	if err != nil {
		return User{}, translateInsertError(err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return User{}, fmt.Errorf("ler id: %w", err)
	}
	return User{
		ID: id, Handle: user.Handle, Name: user.Name, Email: user.Email, PasswordHash: user.PasswordHash,
	}, nil
}

// translateInsertError identifica a chave violada pelo fim da mensagem do MySQL, que traz o
// valor duplicado antes do nome da chave: o conteúdo do email não pode confundir a detecção.
func translateInsertError(err error) error {
	var mysqlErr *mysql.MySQLError
	if errors.As(err, &mysqlErr) && mysqlErr.Number == mysqlDuplicateEntry {
		switch {
		case strings.HasSuffix(mysqlErr.Message, "uq_users_email'"):
			return ErrEmailTaken
		case strings.HasSuffix(mysqlErr.Message, "uq_users_handle'"):
			return ErrHandleTaken
		}
	}
	return fmt.Errorf("inserir usuário: %w", err)
}

func (s Users) FindByEmail(ctx context.Context, email string) (User, error) {
	return s.findOne(ctx, "email = ?", email)
}

func (s Users) FindByHandle(ctx context.Context, handle string) (User, error) {
	return s.findOne(ctx, "handle = ?", handle)
}

func (s Users) FindByID(ctx context.Context, id int64) (User, error) {
	return s.findOne(ctx, "id = ?", id)
}

// findOne recebe condition sempre de constantes deste arquivo; o valor vai como parâmetro.
func (s Users) findOne(ctx context.Context, condition string, value any) (User, error) {
	var user User
	err := s.DB.QueryRowContext(ctx, "SELECT "+userColumns+" FROM users WHERE "+condition, value).
		Scan(&user.ID, &user.Handle, &user.Name, &user.Email, &user.PasswordHash, &user.AvatarURL)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, ErrNotFound
	}
	if err != nil {
		return User{}, fmt.Errorf("buscar usuário: %w", err)
	}
	return user, nil
}
