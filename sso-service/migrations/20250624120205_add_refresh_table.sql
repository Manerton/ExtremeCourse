-- +goose Up
-- +goose StatementBegin
CREATE TABLE refresh_tokens(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash text NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now());
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS refresh_tokens
-- +goose StatementEnd
