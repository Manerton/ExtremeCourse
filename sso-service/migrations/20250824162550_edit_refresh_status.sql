-- +goose Up
-- 1. Добавляем новое поле status (int), по умолчанию 1 (active)
ALTER TABLE refresh_tokens
ADD COLUMN status INT DEFAULT 1;

-- 2. Переносим данные из revoked → status
-- revoked = true → status = 2 (revoked)
-- revoked = false → status = 1 (active)
UPDATE refresh_tokens
SET status = CASE 
    WHEN revoked THEN 2
    ELSE 1
END;

-- 3. Удаляем старое поле revoked
ALTER TABLE refresh_tokens
DROP COLUMN revoked;

-- +goose Down
-- 1. Возвращаем колонку revoked (bool), по умолчанию false
ALTER TABLE refresh_tokens
ADD COLUMN revoked BOOLEAN DEFAULT false;

-- 2. Переносим обратно данные из status → revoked
-- status = 2 → revoked = true
-- всё остальное → revoked = false
UPDATE refresh_tokens
SET revoked = CASE 
    WHEN status = 2 THEN true
    ELSE false
END;

-- 3. Удаляем колонку status
ALTER TABLE refresh_tokens
DROP COLUMN status;
