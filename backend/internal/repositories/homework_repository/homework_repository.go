package homework_repository

import (
	"context"
	"fmt"
	"time"

	homework_model "main/internal/models/homework"
	homework_task_model "main/internal/models/homework_task"
	submission_model "main/internal/models/submission"
	task_model "main/internal/models/task"
	answer_model "main/internal/models/task_answer"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type HomeworkRepository struct{}

func New() *HomeworkRepository {
	return &HomeworkRepository{}
}

func (r *HomeworkRepository) CreateHomework(ctx context.Context, o orm.ORM, hw *homework_model.Homework) (uuid.UUID, error) {
	const op = "repositories.HomeworkRepository.CreateHomework"
	if err := o.Create(ctx, hw); err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", op, err)
	}
	return hw.ID, nil
}

func (r *HomeworkRepository) CreateTask(ctx context.Context, o orm.ORM, t *task_model.Task) (uuid.UUID, error) {
	const op = "repositories.HomeworkRepository.CreateTask"
	if err := o.Create(ctx, t); err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", op, err)
	}
	return t.ID, nil
}

func (r *HomeworkRepository) CreateTaskAnswers(ctx context.Context, o orm.ORM, answers []answer_model.TaskAnswer) error {
	const op = "repositories.HomeworkRepository.CreateTaskAnswers"
	for i := range answers {
		if err := o.Create(ctx, &answers[i]); err != nil {
			return fmt.Errorf("%s: %w", op, err)
		}
	}
	return nil
}

func (r *HomeworkRepository) AddTaskToHomework(ctx context.Context, o orm.ORM, hwTask *homework_task_model.HomeworkTask) error {
	const op = "repositories.HomeworkRepository.AddTaskToHomework"
	if err := o.Create(ctx, hwTask); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (r *HomeworkRepository) GetAvailableHomeworks(ctx context.Context, o orm.ORM, now time.Time) ([]homework_model.Homework, error) {
	const op = "repositories.HomeworkRepository.GetAvailableHomeworks"
	var hwList []homework_model.Homework
	// Условие: статус опубликован, время публикации уже наступило, а дедлайн еще не прошел
	cond := "status = ? AND publish_at <= ? AND deadline_at >= ?"
	err := o.Find(ctx, homework_model.Homework{}, nil, nil, nil, nil, nil, &hwList, cond, homework_model.HomeworkStatusPublished, now, now)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return hwList, nil
}

func (r *HomeworkRepository) GetHomeworkByID(ctx context.Context, o orm.ORM, id uuid.UUID) (homework_model.Homework, error) {
	const op = "repositories.HomeworkRepository.GetHomeworkByID"
	var hw homework_model.Homework
	err := o.First(ctx, homework_model.Homework{}, nil, &hw, homework_model.Homework{ID: id})
	if err != nil {
		return homework_model.Homework{}, fmt.Errorf("%s: %w", op, err)
	}
	return hw, nil
}

func (r *HomeworkRepository) GetHomeworkTasks(ctx context.Context, o orm.ORM, hwID uuid.UUID) ([]task_model.Task, error) {
	const op = "repositories.HomeworkRepository.GetHomeworkTasks"
	var hwTasks []homework_task_model.HomeworkTask
	err := o.Find(ctx, homework_task_model.HomeworkTask{}, nil, nil, nil, nil, nil, &hwTasks, homework_task_model.HomeworkTask{HomeworkID: hwID})
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	tasks := make([]task_model.Task, 0, len(hwTasks))
	for _, ht := range hwTasks {
		var t task_model.Task
		if err := o.First(ctx, task_model.Task{}, nil, &t, task_model.Task{ID: ht.TaskID}); err != nil {
			return nil, fmt.Errorf("%s: %w", op, err)
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

func (r *HomeworkRepository) GetTaskAnswers(ctx context.Context, o orm.ORM, taskID uuid.UUID) ([]answer_model.TaskAnswer, error) {
	const op = "repositories.HomeworkRepository.GetTaskAnswers"
	var answers []answer_model.TaskAnswer
	err := o.Find(ctx, answer_model.TaskAnswer{}, nil, nil, nil, nil, nil, &answers, answer_model.TaskAnswer{TaskId: taskID})
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return answers, nil
}

func (r *HomeworkRepository) GetSubmission(ctx context.Context, o orm.ORM, hwID, userID uuid.UUID) (submission_model.HomeworkSubmission, error) {
	const op = "repositories.HomeworkRepository.GetSubmission"
	var sub submission_model.HomeworkSubmission
	err := o.First(ctx, submission_model.HomeworkSubmission{}, nil, &sub, "homework_id = ? AND user_id = ?", hwID, userID)
	if err != nil {
		return submission_model.HomeworkSubmission{}, fmt.Errorf("%s: %w", op, err)
	}
	return sub, nil
}

func (r *HomeworkRepository) CreateSubmission(ctx context.Context, o orm.ORM, sub *submission_model.HomeworkSubmission) error {
	const op = "repositories.HomeworkRepository.CreateSubmission"
	if err := o.Create(ctx, sub); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (r *HomeworkRepository) CreateSubmissionTaskResults(ctx context.Context, o orm.ORM, results []submission_model.SubmissionTaskResult) error {
	const op = "repositories.HomeworkRepository.CreateSubmissionTaskResults"
	for i := range results {
		if err := o.Create(ctx, &results[i]); err != nil {
			return fmt.Errorf("%s: %w", op, err)
		}
	}
	return nil
}

func (r *HomeworkRepository) GetSubmissionsByHomework(ctx context.Context, o orm.ORM, hwID uuid.UUID) ([]submission_model.HomeworkSubmission, error) {
	const op = "repositories.HomeworkRepository.GetSubmissionsByHomework"
	var subs []submission_model.HomeworkSubmission
	order := "total_score DESC"
	preload := "User"
	err := o.Find(ctx, submission_model.HomeworkSubmission{}, &preload, nil, nil, nil, &order, &subs, "homework_id = ?", hwID)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return subs, nil
}

type EventUserScoreRow struct {
	UserID     uuid.UUID
	TotalScore int
}

func (r *HomeworkRepository) GetEventLeaderboard(ctx context.Context, o orm.ORM, eventID uuid.UUID) ([]EventUserScoreRow, error) {
	const op = "repositories.HomeworkRepository.GetEventLeaderboard"

	// 1. Находим все ID домашних работ, привязанных к данному курсу (event)
	var homeworks []homework_model.Homework
	fields := []string{"id"}
	err := o.Find(ctx, homework_model.Homework{}, nil, &fields, nil, nil, nil, &homeworks, "event_id = ?", eventID)
	if err != nil {
		return nil, fmt.Errorf("%s: find homeworks: %w", op, err)
	}

	if len(homeworks) == 0 {
		return []EventUserScoreRow{}, nil
	}

	hwIDs := make([]uuid.UUID, 0, len(homeworks))
	for _, hw := range homeworks {
		hwIDs = append(hwIDs, hw.ID)
	}

	// 2. Получаем все сдачи по найденным ДЗ
	var submissions []submission_model.HomeworkSubmission
	err = o.Find(ctx, submission_model.HomeworkSubmission{}, nil, nil, nil, nil, nil, &submissions, "homework_id IN ?", hwIDs)
	if err != nil {
		return nil, fmt.Errorf("%s: find submissions: %w", op, err)
	}

	// 3. Агрегируем суммарные баллы каждого пользователя
	scoreMap := make(map[uuid.UUID]int)
	for _, sub := range submissions {
		scoreMap[sub.UserID] += sub.TotalScore
	}

	results := make([]EventUserScoreRow, 0, len(scoreMap))
	for uID, score := range scoreMap {
		results = append(results, EventUserScoreRow{
			UserID:     uID,
			TotalScore: score,
		})
	}

	return results, nil
}
