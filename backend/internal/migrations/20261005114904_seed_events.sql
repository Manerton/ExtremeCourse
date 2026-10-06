-- +goose Up
-- +goose StatementBegin
INSERT INTO events (id, name, subject, class, status) VALUES
                                                          (gen_random_uuid(), 'Олимпиадная математика', 'Математика', 9, 2),
                                                          (gen_random_uuid(), 'Олимпиадная физика', 'Физика', 9, 2),
                                                          (gen_random_uuid(), 'Олимпиадная химия', 'Химия', 9, 2),
                                                          (gen_random_uuid(), 'Олимпиадная биология', 'Биология', 10, 2),
                                                          (gen_random_uuid(), 'Олимпиадная информатика (профиль «Программирование»)', 'Информатика', 9, 2),
                                                          (gen_random_uuid(), 'Олимпиадная экономика', 'Экономика', 11, 2);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM events
WHERE name IN (
               'Олимпиадная математика',
               'Олимпиадная физика',
               'Олимпиадная химия',
               'Олимпиадная биология',
               'Олимпиадная информатика (профиль «Программирование»)',
               'Олимпиадная экономика'
    );
-- +goose StatementEnd