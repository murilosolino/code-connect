.DEFAULT_GOAL := help
DC := docker compose

.PHONY: help up down start stop restart build rebuild logs logs-backend logs-frontend logs-mysql ps \
        db-cli db-root db-dump db-restore db-reset sh-backend sh-frontend \
        backend-tidy backend-test frontend-install frontend-lint clean prod-build hooks-install

help: ## Lista os comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

.env:
	cp .env.example .env

up: .env ## Sobe tudo em background (build incluso)
	$(DC) up -d --build

down: ## Para e remove os containers (mantém volumes)
	$(DC) down

start: ## Inicia containers já criados
	$(DC) start

stop: ## Para containers sem removê-los
	$(DC) stop

restart: ## Reinicia os containers
	$(DC) restart

build: ## Builda as imagens
	$(DC) build

rebuild: ## Rebuilda as imagens sem cache
	$(DC) build --no-cache

ps: ## Status dos containers
	$(DC) ps

logs: ## Logs de todos os serviços (follow)
	$(DC) logs -f

logs-backend: ## Logs do backend
	$(DC) logs -f backend

logs-frontend: ## Logs do frontend
	$(DC) logs -f frontend

logs-mysql: ## Logs do MySQL
	$(DC) logs -f mysql

db-cli: ## Abre o cliente MySQL interativo (usuário da aplicação)
	$(DC) --profile tools run --rm mysql-cli

db-root: ## Abre o cliente MySQL interativo como root
	$(DC) exec mysql sh -c 'mysql -uroot -p"$$MYSQL_ROOT_PASSWORD" $$MYSQL_DATABASE'

db-dump: ## Gera backup em db/dump.sql
	$(DC) exec -T mysql sh -c 'mysqldump -uroot -p"$$MYSQL_ROOT_PASSWORD" $$MYSQL_DATABASE' > db/dump.sql

db-restore: ## Restaura db/dump.sql
	$(DC) exec -T mysql sh -c 'mysql -uroot -p"$$MYSQL_ROOT_PASSWORD" $$MYSQL_DATABASE' < db/dump.sql

db-reset: ## APAGA o volume do MySQL e recria o banco
	$(DC) rm -sf mysql
	docker volume rm -f $$(basename $(CURDIR) | tr 'A-Z' 'a-z')_mysql_data
	$(DC) up -d mysql

sh-backend: ## Shell no container do backend
	$(DC) exec backend sh

sh-frontend: ## Shell no container do frontend
	$(DC) exec frontend sh

backend-tidy: ## go mod tidy no container
	$(DC) exec backend go mod tidy

backend-test: ## Roda os testes do backend (com --race)
	$(DC) exec -e CGO_ENABLED=1 backend go test --race ./...

frontend-install: ## Instala dependência: make frontend-install pkg=nome
	$(DC) exec frontend npm install $(pkg)

frontend-lint: ## Checagem de tipos do frontend
	$(DC) exec frontend npm run lint

prod-build: ## Builda as imagens de produção (target prod)
	docker build --target prod -t code-connect-backend:prod ./backend
	docker build --target prod -t code-connect-frontend:prod ./frontend

hooks-install: ## Ativa os git hooks versionados (.githooks)
	git config core.hooksPath .githooks
	chmod +x .githooks/*

clean: ## Remove containers, volumes e imagens locais (DESTRUTIVO)
	$(DC) --profile tools down -v --rmi local
