-- +goose Up
-- +goose StatementBegin
ALTER TABLE refresh_tokens
    RENAME COLUMN token_hash TO token;

ALTER TABLE refresh_tokens
    ADD COLUMN device_id UUID,
    ADD COLUMN device_name TEXT;

CREATE INDEX idx_refresh_tokens_device_id ON refresh_tokens(device_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_refresh_tokens_device_id;

ALTER TABLE refresh_tokens
    DROP COLUMN device_id,
    DROP COLUMN device_name;

ALTER TABLE refresh_tokens
    RENAME COLUMN token TO token_hash;
-- +goose StatementEnd
