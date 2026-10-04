package homework_service

import (
	"context"
	"log/slog"
	"sort"
	"strings"
	"time"

	homework_dto "main/internal/dto/homework"
	"main/internal/lib/errs"
	"main/internal/lib/liblogger"
	homework_model "main/internal/models/homework"
	homework_task_model "main/internal/models/homework_task"
	submission_model "main/internal/models/submission"
	task_model "main/internal/models/task"
	answer_model "main/internal/models/task_answer"
	"main/internal/models/user"
	hwRepo "main/internal/repositories/homework_repository"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type UserRepository interface {
	GetByListId(ctx context.Context, orm orm.ORM, ids []uuid.UUID) ([]user.User, error)
}

type HomeworkRepository interface {
	CreateHomework(ctx context.Context, o orm.ORM, hw *homework_model.Homework) (uuid.UUID, error)
	CreateTask(ctx context.Context, o orm.ORM, t *task_model.Task) (uuid.UUID, error)
	CreateTaskAnswers(ctx context.Context, o orm.ORM, answers []answer_model.TaskAnswer) error
	AddTaskToHomework(ctx context.Context, o orm.ORM, hwTask *homework_task_model.HomeworkTask) error
	GetAvailableHomeworks(ctx context.Context, o orm.ORM, now time.Time) ([]homework_model.Homework, error)
	GetHomeworkByID(ctx context.Context, o orm.ORM, id uuid.UUID) (homework_model.Homework, error)
	GetHomeworkTasks(ctx context.Context, o orm.ORM, hwID uuid.UUID) ([]task_model.Task, error)
	GetTaskAnswers(ctx context.Context, o orm.ORM, taskID uuid.UUID) ([]answer_model.TaskAnswer, error)
	GetSubmission(ctx context.Context, o orm.ORM, hwID, userID uuid.UUID) (submission_model.HomeworkSubmission, error)
	CreateSubmission(ctx context.Context, o orm.ORM, sub *submission_model.HomeworkSubmission) error
	CreateSubmissionTaskResults(ctx context.Context, o orm.ORM, results []submission_model.SubmissionTaskResult) error
	GetSubmissionsByHomework(ctx context.Context, o orm.ORM, hwID uuid.UUID) ([]submission_model.HomeworkSubmission, error)
	GetEventLeaderboard(ctx context.Context, o orm.ORM, eventID uuid.UUID) ([]hwRepo.EventUserScoreRow, error)
}

type HomeworkService struct {
	db       orm.ORM
	log      *slog.Logger
	repo     HomeworkRepository
	userRepo UserRepository
}

func New(log *slog.Logger, db orm.ORM, repo HomeworkRepository) *HomeworkService {
	return &HomeworkService{
		db:   db,
		log:  log.With(slog.String("owner", "HomeworkService")),
		repo: repo,
	}
}

func (s *HomeworkService) CreateHomework(ctx context.Context, dto homework_dto.CreateHomeworkRequestDTO) (uuid.UUID, error) {
	const op = "services.HomeworkService.CreateHomework"
	log := s.log.With(slog.String("op", op))

	if dto.DeadlineAt.Before(dto.PublishAt) {
		return uuid.Nil, errs.ErrBadRequest.Wrap("deadline cannot be earlier than publish date")
	}

	hw := homework_model.Homework{
		Name:       dto.Name,
		Status:     homework_model.HomeworkStatusPublished,
		PublishAt:  dto.PublishAt,
		DeadlineAt: dto.DeadlineAt,
	}

	id, err := s.repo.CreateHomework(ctx, s.db, &hw)
	if err != nil {
		log.Error("failed create homework", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError.Wrap("failed create homework")
	}
	return id, nil
}

func (s *HomeworkService) CreateTask(ctx context.Context, dto homework_dto.CreateTaskRequestDTO) (uuid.UUID, error) {
	const op = "services.HomeworkService.CreateTask"
	log := s.log.With(slog.String("op", op))

	tx, err := s.db.TransactionBegin()
	if err != nil {
		log.Error("failed start tx", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError
	}
	defer tx.TransactionRollback()

	t := task_model.Task{
		Name:        dto.Name,
		Description: dto.Description,
		MaxPoints:   dto.MaxPoints,
	}

	taskID, err := s.repo.CreateTask(ctx, tx, &t)
	if err != nil {
		log.Error("failed create task", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError
	}

	answers := make([]answer_model.TaskAnswer, 0, len(dto.Answers))
	for _, a := range dto.Answers {
		answers = append(answers, answer_model.TaskAnswer{
			TaskId:  taskID,
			Answer:  a.Answer,
			Correct: a.Correct,
		})
	}

	if err := s.repo.CreateTaskAnswers(ctx, tx, answers); err != nil {
		log.Error("failed save answers", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError
	}

	if err := tx.TransactionCommit(); err != nil {
		return uuid.Nil, errs.ErrInternalError
	}
	return taskID, nil
}

func (s *HomeworkService) AddTaskToHomework(ctx context.Context, hwIDStr, taskIDStr string) error {
	const op = "services.HomeworkService.AddTaskToHomework"
	log := s.log.With(slog.String("op", op))

	hwID, err := uuid.Parse(hwIDStr)
	if err != nil {
		return errs.ErrBadRequest.Wrap("invalid homework id")
	}
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		return errs.ErrBadRequest.Wrap("invalid task id")
	}

	relation := homework_task_model.HomeworkTask{
		HomeworkID: hwID,
		TaskID:     taskID,
	}
	if err := s.repo.AddTaskToHomework(ctx, s.db, &relation); err != nil {
		log.Error("failed bind task to homework", liblogger.Err(err))
		return errs.ErrInternalError
	}
	return nil
}

func (s *HomeworkService) GetAvailableHomeworks(ctx context.Context) ([]homework_dto.HomeworkResponseDTO, error) {
	const op = "services.HomeworkService.GetAvailableHomeworks"
	log := s.log.With(slog.String("op", op))

	items, err := s.repo.GetAvailableHomeworks(ctx, s.db, time.Now())
	if err != nil {
		log.Error("failed fetch available homeworks", liblogger.Err(err))
		return nil, errs.ErrInternalError
	}

	res := make([]homework_dto.HomeworkResponseDTO, 0, len(items))
	for _, item := range items {
		res = append(res, homework_dto.HomeworkResponseDTO{
			ID:         item.ID.String(),
			Name:       item.Name,
			Status:     item.Status,
			PublishAt:  item.PublishAt,
			DeadlineAt: item.DeadlineAt,
		})
	}
	return res, nil
}

func (s *HomeworkService) SubmitHomework(ctx context.Context, hwIDStr, userIDStr string, dto homework_dto.SubmitHomeworkRequestDTO) (homework_dto.SubmissionResponseDTO, error) {
	const op = "services.HomeworkService.SubmitHomework"
	log := s.log.With(slog.String("op", op))

	hwID, err := uuid.Parse(hwIDStr)
	if err != nil {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrBadRequest.Wrap("invalid homework id")
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrBadRequest.Wrap("invalid user id")
	}

	// 1. Проверяем состояние ДЗ (открытость и дедлайн)
	hw, err := s.repo.GetHomeworkByID(ctx, s.db, hwID)
	if err != nil {
		if s.db.IsNotFound(err) {
			return homework_dto.SubmissionResponseDTO{}, errs.ErrBadRequest.Wrap("homework not found")
		}
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	now := time.Now()
	if hw.Status != homework_model.HomeworkStatusPublished || now.Before(hw.PublishAt) {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrBadRequest.Wrap("homework is not available")
	}
	if now.After(hw.DeadlineAt) {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrBadRequest.Wrap("deadline has passed")
	}

	// 2. Запрет повторной сдачи (иммутабельность)
	_, err = s.repo.GetSubmission(ctx, s.db, hwID, userID)
	if err == nil {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrBadRequest.Wrap("homework has already been submitted and cannot be modified")
	} else if !s.db.IsNotFound(err) {
		log.Error("failed checking existing submission", liblogger.Err(err))
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	// 3. Получаем задачи этой работы
	tasks, err := s.repo.GetHomeworkTasks(ctx, s.db, hwID)
	if err != nil {
		log.Error("failed get tasks", liblogger.Err(err))
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	taskMap := make(map[uuid.UUID]task_model.Task, len(tasks))
	for _, t := range tasks {
		taskMap[t.ID] = t
	}

	answersByUser := make(map[uuid.UUID]string)
	for _, a := range dto.Answers {
		tid, parseErr := uuid.Parse(a.TaskID)
		if parseErr == nil {
			answersByUser[tid] = a.Answer
		}
	}

	// 4. Автоматическая проверка
	tx, err := s.db.TransactionBegin()
	if err != nil {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}
	defer tx.TransactionRollback()

	subID := uuid.New()
	totalScore := 0
	results := make([]submission_model.SubmissionTaskResult, 0, len(tasks))
	dtoResults := make([]homework_dto.TaskResultResponseDTO, 0, len(tasks))

	for tID, tModel := range taskMap {
		userAns := answersByUser[tID]
		validAnswers, err := s.repo.GetTaskAnswers(ctx, tx, tID)
		if err != nil {
			log.Error("failed get correct answers", liblogger.Err(err))
			return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
		}

		isCorrect := false
		for _, va := range validAnswers {
			if va.Correct && strings.EqualFold(strings.TrimSpace(va.Answer), strings.TrimSpace(userAns)) {
				isCorrect = true
				break
			}
		}

		score := 0
		if isCorrect {
			score = tModel.MaxPoints
		}
		totalScore += score

		results = append(results, submission_model.SubmissionTaskResult{
			SubmissionID:  subID,
			TaskID:        tID,
			UserAnswer:    userAns,
			IsCorrect:     isCorrect,
			PointsAwarded: score,
		})

		dtoResults = append(dtoResults, homework_dto.TaskResultResponseDTO{
			TaskID:        tID.String(),
			UserAnswer:    userAns,
			IsCorrect:     isCorrect,
			PointsAwarded: score,
		})
	}

	sub := submission_model.HomeworkSubmission{
		ID:          subID,
		HomeworkID:  hwID,
		UserID:      userID,
		TotalScore:  totalScore,
		SubmittedAt: now,
	}

	if err := s.repo.CreateSubmission(ctx, tx, &sub); err != nil {
		log.Error("failed save submission", liblogger.Err(err))
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	if err := s.repo.CreateSubmissionTaskResults(ctx, tx, results); err != nil {
		log.Error("failed save task results", liblogger.Err(err))
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	if err := tx.TransactionCommit(); err != nil {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	return homework_dto.SubmissionResponseDTO{
		ID:          subID.String(),
		HomeworkID:  hwID.String(),
		UserID:      userID.String(),
		TotalScore:  totalScore,
		SubmittedAt: now,
		Results:     dtoResults,
	}, nil
}

func (s *HomeworkService) GetLeaderboard(ctx context.Context, hwIDStr string) ([]homework_dto.StudentHomeworkLeaderboardDTO, error) {
	const op = "services.HomeworkService.GetLeaderboard"
	log := s.log.With(slog.String("op", op))

	hwID, err := uuid.Parse(hwIDStr)
	if err != nil {
		return nil, errs.ErrBadRequest.Wrap("invalid homework id")
	}

	submissions, err := s.repo.GetSubmissionsByHomework(ctx, s.db, hwID)
	if err != nil {
		log.Error("failed get stats", liblogger.Err(err))
		return nil, errs.ErrInternalError
	}

	leaderboard := make([]homework_dto.StudentHomeworkLeaderboardDTO, 0, len(submissions))
	for _, sub := range submissions {
		leaderboard = append(leaderboard, homework_dto.StudentHomeworkLeaderboardDTO{
			UserID:     sub.UserID.String(),
			UserFIO:    strings.TrimSpace(sub.User.Surname + " " + sub.User.Firstname),
			TotalScore: sub.TotalScore,
		})
	}
	return leaderboard, nil
}

func (s *HomeworkService) GetEventLeaderboard(ctx context.Context, eventIDStr string) ([]homework_dto.EventLeaderboardItemDTO, error) {
	const op = "services.HomeworkService.GetEventLeaderboard"
	log := s.log.With(slog.String("op", op))

	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		log.Error("failed parse event id", liblogger.Err(err))
		return nil, errs.ErrBadRequest.Wrap("invalid event id")
	}

	userScores, err := s.repo.GetEventLeaderboard(ctx, s.db, eventID)
	if err != nil {
		log.Error("failed get event leaderboard rows", liblogger.Err(err))
		return nil, errs.ErrInternalError
	}

	if len(userScores) == 0 {
		return []homework_dto.EventLeaderboardItemDTO{}, nil
	}

	// Сортировка по суммарным баллам (DESC)
	sort.Slice(userScores, func(i, j int) bool {
		return userScores[i].TotalScore > userScores[j].TotalScore
	})

	// Сбор UserID для выборки профилей
	userIDs := make([]uuid.UUID, 0, len(userScores))
	for _, row := range userScores {
		userIDs = append(userIDs, row.UserID)
	}

	users, err := s.userRepo.GetByListId(ctx, s.db, userIDs)
	if err != nil {
		log.Error("failed get users for leaderboard", liblogger.Err(err))
		return nil, errs.ErrInternalError
	}

	usersMap := make(map[uuid.UUID]user.User, len(users))
	for _, u := range users {
		usersMap[u.ID] = u
	}

	// Формирование итоговой таблицы с присвоением рангов
	leaderboard := make([]homework_dto.EventLeaderboardItemDTO, 0, len(userScores))
	for i, row := range userScores {
		u := usersMap[row.UserID]
		fio := strings.TrimSpace(u.Surname + " " + u.Firstname + " " + u.Patronymic)
		if fio == "" {
			fio = u.Email
		}

		leaderboard = append(leaderboard, homework_dto.EventLeaderboardItemDTO{
			Rank:       i + 1,
			UserID:     row.UserID.String(),
			UserFIO:    fio,
			TotalScore: row.TotalScore,
		})
	}

	return leaderboard, nil
}
