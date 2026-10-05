# ---- dev: hot reload com air ----
FROM golang:1.27-alpine AS dev
# gcc + musl-dev: o race detector (go test --race) exige CGO
RUN apk add --no-cache gcc musl-dev
RUN go install github.com/air-verse/air@latest
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]

# ---- build ----
FROM golang:1.27-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /bin/api ./cmd/api

# ---- prod ----
FROM alpine:3.21 AS prod
RUN apk add --no-cache ca-certificates tzdata
COPY --from=build /bin/api /bin/api
EXPOSE 8080
CMD ["/bin/api"]
