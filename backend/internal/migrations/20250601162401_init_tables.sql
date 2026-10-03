-- +goose Up

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    firstname VARCHAR(128) NOT NULL,
    surname VARCHAR(128) NOT NULL,
    patronymic VARCHAR(128) NOT NULL,
    phone_number VARCHAR(20),
    birthdate DATE NOT NULL,
    gender int,
    role int NOT NULL,
    activated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    region INTEGER NOT NULL
);

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    disability INTEGER NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE ON UPDATE CASCADE,
    citizenship INTEGER NOT NULL,
    class_number INTEGER NOT NULL
);


CREATE INDEX idx_participants_user_id ON participants(user_id);


-- +goose Down
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS districts;

