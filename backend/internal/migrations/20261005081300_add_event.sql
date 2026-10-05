-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    class INT NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 0
);

-- Индекс для фильтрации по статусу (часто требуется для активных/завершенных событий)
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS events;
-- +goose StatementEnd