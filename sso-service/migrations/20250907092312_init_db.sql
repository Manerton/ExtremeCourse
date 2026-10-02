-- +goose Up
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS applications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,
    event_id     UUID NOT NULL,
    profile varchar(128),
    class_participation int not null,
    status       INT NOT NULL DEFAULT 1,
    reason       INT DEFAULT NULL,
    code         TEXT DEFAULT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, event_id) -- можно без имени, а можно с именем

    );

-- +goose Down
DROP TABLE IF EXISTS applications;
