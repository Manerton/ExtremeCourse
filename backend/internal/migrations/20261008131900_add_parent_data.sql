-- +goose Up
-- +goose StatementBegin
ALTER TABLE participants
    ADD COLUMN parent_number VARCHAR(32),
    ADD COLUMN parent_fio VARCHAR(255);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE participants
    DROP COLUMN IF EXISTS parent_fio,
    DROP COLUMN IF EXISTS parent_number;
-- +goose StatementEnd