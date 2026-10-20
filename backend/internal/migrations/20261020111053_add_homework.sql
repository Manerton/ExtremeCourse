-- +goose Up
-- +goose StatementBegin

-- 1. Таблица домашних работ (Homework)
CREATE TABLE IF NOT EXISTS homeworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    name TEXT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    publish_at TIMESTAMPTZ NOT NULL,
    deadline_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_homeworks_event_id ON homeworks(event_id);
CREATE INDEX IF NOT EXISTS idx_homeworks_status_dates ON homeworks(status, publish_at, deadline_at);

-- 2. Таблица заданий (Task)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    max_points INT NOT NULL DEFAULT 0
);

-- 3. Таблица вариантов ответов к заданию (TaskAnswer)
CREATE TABLE IF NOT EXISTS task_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON UPDATE CASCADE ON DELETE CASCADE,
    answer TEXT NOT NULL,
    correct BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_task_answers_task_id ON task_answers(task_id);

-- 4. Связующая таблица ДЗ и заданий (HomeworkTask)
CREATE TABLE IF NOT EXISTS homework_tasks (
    homework_id UUID NOT NULL REFERENCES homeworks(id) ON UPDATE CASCADE ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (homework_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_homework_tasks_task_id ON homework_tasks(task_id);

-- 5. Таблица отправленных решений ДЗ (HomeworkSubmission)
CREATE TABLE IF NOT EXISTS homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id UUID NOT NULL REFERENCES homeworks(id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    total_score INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Защита на уровне БД от повторной сдачи одного и того же ДЗ одним пользователем
    CONSTRAINT uq_homework_submissions_hw_user UNIQUE (homework_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_homework_submissions_homework_id ON homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_user_id ON homework_submissions(user_id);

-- 6. Таблица результатов по конкретным задачам внутри сдачи (SubmissionTaskResult)
CREATE TABLE IF NOT EXISTS submission_task_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES homework_submissions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_answer TEXT NOT NULL DEFAULT '',
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_awarded INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_submission_task UNIQUE (submission_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_task_results_submission_id ON submission_task_results(submission_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS submission_task_results;
DROP TABLE IF EXISTS homework_submissions;
DROP TABLE IF EXISTS homework_tasks;
DROP TABLE IF EXISTS task_answers;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS homeworks;

-- +goose StatementEnd