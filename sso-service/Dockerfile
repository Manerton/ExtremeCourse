FROM golang:1.24-alpine as builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Копируем исходный код приложения в контейнер
COPY . .

# Сборка приложения
RUN go build -o migrator ./cmd/migrator/main.go
RUN go build -o sso-service ./cmd/server/main.go

# Второй этап: используем минимальный образ для запуска приложения
FROM alpine:latest



# Рабочая директория в контейнере
WORKDIR /app

# Копируем скомпилированное приложение из первого этапа
COPY --from=builder /app/migrator /app/migrator
COPY --from=builder /app/sso-service /app/sso-service
COPY --from=builder /app/config-yaml /app/config-yaml
COPY --from=builder /app/migrations /app/migrations

# Открываем порт приложения
EXPOSE 8080

# Устанавливаем bash или sh для запуска нескольких команд
RUN apk add --no-cache ca-certificates bash
