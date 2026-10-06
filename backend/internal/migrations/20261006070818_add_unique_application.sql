-- +goose Up
-- +goose StatementBegin
-- 1. Добавляем ограничение уникальности для пары (event_id, user_id)
ALTER TABLE applications
    ADD CONSTRAINT uq_applications_event_user UNIQUE (event_id, user_id);

-- 2. Удаляем старый индекс по event_id, так как составное ограничение uq_applications_event_user
-- покрывает поиск по event_id (первая колонка в составном b-tree индексе)
DROP INDEX IF EXISTS idx_applications_event_id;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- 1. Возвращаем отдельный индекс по event_id
CREATE INDEX IF NOT EXISTS idx_applications_event_id ON applications(event_id);

-- 2. Снимаем ограничение уникальности
ALTER TABLE applications
    DROP CONSTRAINT IF EXISTS uq_applications_event_user;
-- +goose StatementEnd