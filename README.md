# Code Connect

Monorepo: React + Vite + Tailwind + TypeScript (`frontend/`) e API REST em Go + Gin (`backend/`), com MySQL em Docker.

## Início rápido

```sh
make up        # copia .env, builda e sobe tudo
make db-cli    # cliente MySQL interativo
make help      # todos os comandos
```

- Frontend: http://localhost:5173
- API: http://localhost:8080/api/health
- MySQL: localhost:3307 (dados no volume `mysql_data`)

## Estrutura

```
backend/    API Go (cmd/api, internal/{config,database,handlers,router})
frontend/   App React (src/)
db/         Arquivos .sql montados em /db no mysql-cli (e dumps)
```
