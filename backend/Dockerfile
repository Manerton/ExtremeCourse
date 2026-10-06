FROM golang:1.25-alpine as builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download 

# Копируем исходный код приложения в контейнер
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/backend ./cmd/server

# Второй этап: используем минимальный образ для запуска приложения
FROM alpine:3.20

# Рабочая директория в контейнере
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

RUN mkdir -p /app/upload

# Копируем скомпилированное приложение из первого этапа
COPY --from=builder /app/backend /app/backend
COPY --from=builder /app/config-yaml /app/config-yaml
COPY --from=builder /app/internal/migrations ./internal/migrations
# Открываем порт приложения
EXPOSE 8080

ENTRYPOINT ["/app/backend"]
