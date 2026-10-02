-- +goose Up

-- Сначала создаём обычных пользователей (admin, jury, organizer)
INSERT INTO users (id, email, password_hash, firstname, surname, patronymic, phone_number, birthdate, gender, role, activated, created_at) VALUES
    ('33333333-3333-3333-3333-333333333331', 'admin@mail.ru',      '$2a$10$XgdgSDVimAu/Gy6gNaKMLeRuYhx1e1Aoj.vr3kZSuKLomVMI/lVDq', 'Админ',      'Системный',   'Админович',   '+70000000001', '1980-01-01', 1, 1, true, now()),
     ('33333333-3333-3333-3333-333333333332', 'jury@mail.ru',       '$2a$10$XgdgSDVimAu/Gy6gNaKMLeRuYhx1e1Aoj.vr3kZSuKLomVMI/lVDq', 'Иван',       'Судья',       'Петрович',    '+70000000002', '1985-02-02', 1, 3, true, now()),
     ('33333333-3333-3333-3333-333333333333', 'organizer@mail.ru',  '$2a$10$XgdgSDVimAu/Gy6gNaKMLeRuYhx1e1Aoj.vr3kZSuKLomVMI/lVDq', 'Ольга',      'Организатор', 'Сергеевна',   '+70000000003', '1990-03-03', 2, 4, true, now());
-- Создаём пользователя-участника
INSERT INTO users (id, email, password_hash, firstname, surname, patronymic, phone_number, birthdate, gender, role, activated, created_at) VALUES
    ('33333333-3333-3333-3333-333333333334', 'makar@mail.ru', '$2a$10$XgdgSDVimAu/Gy6gNaKMLeRuYhx1e1Aoj.vr3kZSuKLomVMI/lVDq', 'Макар', 'Иванов', 'Макарович', '+70000000004', '2008-05-15', 1, 2, true, now());

-- школа уже есть в базе — берём её ID
WITH school AS (
    SELECT id FROM schools WHERE name = 'МБОУ г. Астрахани "Лицей №1"' LIMIT 1
    )
INSERT INTO participants (user_id, disability, school_id, citizenship, class_number)
SELECT
    '33333333-3333-3333-3333-333333333334',  -- user_id участника
    0,                                         -- нет инвалидности
    (SELECT id FROM school),                   -- school_id
    1,                                         -- гражданство РФ
    10                                         -- 10 класс
    WHERE EXISTS (SELECT 1 FROM school);           -- защита от ошибки, если школа не найдена


-- Если хочешь добавить ещё участников — просто повторяй блок выше с новыми данными
-- Пример второго участника:
-- INSERT INTO users (...) VALUES ('новый-uuid', ... , role => 2, ...);
-- INSERT INTO participants (user_id, disability, school_id, citizenship, class_number) VALUES ('новый-uuid', 0, (SELECT id FROM schools WHERE name = '...'), 1, 11);


-- +goose Down
-- Удаляем всех тестовых пользователей (включая участника)
DELETE FROM participants WHERE user_id IN (
                                           '33333333-3333-3333-3333-333333333331',
                                           '33333333-3333-3333-3333-333333333332',
                                           '33333333-3333-3333-3333-333333333333',
                                           '33333333-3333-3333-3333-333333333334'
    );

DELETE FROM users WHERE id IN (
                               '33333333-3333-3333-3333-333333333331',
                               '33333333-3333-3333-3333-333333333332',
                               '33333333-3333-3333-3333-333333333333',
                               '33333333-3333-3333-3333-333333333334'
    );