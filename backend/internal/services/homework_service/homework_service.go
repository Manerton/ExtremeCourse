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
	GetAvailableHomeworksByEvent(ctx context.Context, o orm.ORM, eventID uuid.UUID, now time.Time) ([]homework_model.Homework, error)
	GetHomeworkByID(ctx context.Context, o orm.ORM, id uuid.UUID) (homework_model.Homework, error)
	GetHomeworkTasks(ctx context.Context, o orm.ORM, hwID uuid.UUID) ([]task_model.Task, error)
	GetTaskAnswers(ctx context.Context, o orm.ORM, taskID uuid.UUID) ([]answer_model.TaskAnswer, error)
	GetTaskAnswersByTaskIDs(ctx context.Context, o orm.ORM, taskIDs []uuid.UUID) ([]answer_model.TaskAnswer, error)
	GetSubmissionTaskResults(ctx context.Context, o orm.ORM, submissionID uuid.UUID) ([]submission_model.SubmissionTaskResult, error)
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

func New(log *slog.Logger, db orm.ORM, repo HomeworkRepository, userRepo UserRepository) *HomeworkService {
	return &HomeworkService{
		db:       db,
		log:      log.With(slog.String("owner", "HomeworkService")),
		repo:     repo,
		userRepo: userRepo,
	}
}

func (s *HomeworkService) CreateHomework(ctx context.Context, dto homework_dto.CreateHomeworkRequestDTO) (uuid.UUID, error) {
	const op = "services.HomeworkService.CreateHomework"
	log := s.log.With(slog.String("op", op))

	eventID, err := uuid.Parse(dto.EventID)
	if err != nil {
		return uuid.Nil, errs.ErrBadRequest.Wrap("invalid event id")
	}

	if dto.DeadlineAt.Before(dto.PublishAt) {
		return uuid.Nil, errs.ErrBadRequest.Wrap("deadline cannot be earlier than publish date")
	}

	hw := homework_model.Homework{
		EventId:    eventID,
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

// GetAvailableHomeworks возвращает доступные ДЗ (все, либо отфильтрованные по eventIDStr)
func (s *HomeworkService) GetAvailableHomeworks(ctx context.Context, eventIDStr string) ([]homework_dto.HomeworkResponseDTO, error) {
	const op = "services.HomeworkService.GetAvailableHomeworks"
	log := s.log.With(slog.String("op", op))

	now := time.Now()
	var (
		items []homework_model.Homework
		err   error
	)

	if strings.TrimSpace(eventIDStr) != "" {
		eventID, parseErr := uuid.Parse(eventIDStr)
		if parseErr != nil {
			return nil, errs.ErrBadRequest.Wrap("invalid event id")
		}
		items, err = s.repo.GetAvailableHomeworksByEvent(ctx, s.db, eventID, now)
	} else {
		items, err = s.repo.GetAvailableHomeworks(ctx, s.db, now)
	}

	if err != nil {
		log.Error("failed fetch available homeworks", liblogger.Err(err))
		return nil, errs.ErrInternalError
	}

	res := make([]homework_dto.HomeworkResponseDTO, 0, len(items))
	for _, item := range items {
		res = append(res, homework_dto.HomeworkResponseDTO{
			ID:         item.ID.String(),
			EventID:    item.EventId.String(),
			Name:       item.Name,
			Status:     item.Status,
			PublishAt:  item.PublishAt,
			DeadlineAt: item.DeadlineAt,
		})
	}
	return res, nil
}

func (s *HomeworkService) GetMySubmission(ctx context.Context, hwIDStr, userIDStr string) (homework_dto.SubmissionResponseDTO, error) {
	const op = "services.HomeworkService.GetMySubmission"
	log := s.log.With(slog.String("op", op))

	hwID, err := uuid.Parse(hwIDStr)
	if err != nil {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrBadRequest.Wrap("invalid homework id")
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrBadRequest.Wrap("invalid user id")
	}

	sub, err := s.repo.GetSubmission(ctx, s.db, hwID, userID)
	if err != nil {
		if s.db.IsNotFound(err) {
			return homework_dto.SubmissionResponseDTO{}, errs.ErrNotFound.Wrap("submission not found")
		}
		log.Error("failed get user submission", liblogger.Err(err))
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	taskResults, err := s.repo.GetSubmissionTaskResults(ctx, s.db, sub.ID)
	if err != nil {
		log.Error("failed get submission task results", liblogger.Err(err))
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	dtoResults := make([]homework_dto.TaskResultResponseDTO, 0, len(taskResults))
	for _, tr := range taskResults {
		dtoResults = append(dtoResults, homework_dto.TaskResultResponseDTO{
			TaskID:        tr.TaskID.String(),
			UserAnswer:    tr.UserAnswer,
			IsCorrect:     tr.IsCorrect,
			PointsAwarded: tr.PointsAwarded,
		})
	}

	return homework_dto.SubmissionResponseDTO{
		ID:          sub.ID.String(),
		HomeworkID:  sub.HomeworkID.String(),
		UserID:      sub.UserID.String(),
		TotalScore:  sub.TotalScore,
		SubmittedAt: sub.SubmittedAt,
		Results:     dtoResults,
	}, nil
}

// Нормализация ответа: убирает крайние и лишние внутренние пробелы, приводит к нижнему регистру
func normalizeAnswer(s string) string {
	return strings.ToLower(strings.Join(strings.Fields(s), " "))
}

// GetHomeworkWithTasks возвращает ДЗ со списком задач (без обращения к task_answers, чтобы не слить ответы)
func (s *HomeworkService) GetHomeworkWithTasks(ctx context.Context, hwIDStr string) (homework_dto.HomeworkDetailResponseDTO, error) {
	const op = "services.HomeworkService.GetHomeworkWithTasks"
	log := s.log.With(slog.String("op", op))

	hwID, err := uuid.Parse(hwIDStr)
	if err != nil {
		return homework_dto.HomeworkDetailResponseDTO{}, errs.ErrBadRequest.Wrap("invalid homework id")
	}

	hw, err := s.repo.GetHomeworkByID(ctx, s.db, hwID)
	if err != nil {
		if s.db.IsNotFound(err) {
			return homework_dto.HomeworkDetailResponseDTO{}, errs.ErrBadRequest.Wrap("homework not found")
		}
		log.Error("failed get homework by id", liblogger.Err(err))
		return homework_dto.HomeworkDetailResponseDTO{}, errs.ErrInternalError
	}

	now := time.Now()
	if hw.Status != homework_model.HomeworkStatusPublished || now.Before(hw.PublishAt) {
		return homework_dto.HomeworkDetailResponseDTO{}, errs.ErrBadRequest.Wrap("homework is not available")
	}

	tasks, err := s.repo.GetHomeworkTasks(ctx, s.db, hwID)
	if err != nil {
		log.Error("failed get homework tasks", liblogger.Err(err))
		return homework_dto.HomeworkDetailResponseDTO{}, errs.ErrInternalError
	}

	taskDTOs := make([]homework_dto.HomeworkTaskResponseDTO, 0, len(tasks))
	for _, t := range tasks {
		taskDTOs = append(taskDTOs, homework_dto.HomeworkTaskResponseDTO{
			ID:          t.ID.String(),
			Name:        t.Name,
			Description: t.Description,
			MaxPoints:   t.MaxPoints,
		})
	}

	return homework_dto.HomeworkDetailResponseDTO{
		ID:         hw.ID.String(),
		EventID:    hw.EventId.String(),
		Name:       hw.Name,
		Status:     hw.Status,
		PublishAt:  hw.PublishAt,
		DeadlineAt: hw.DeadlineAt,
		Tasks:      taskDTOs,
	}, nil
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

	// 2. Запрет повторной сдачи (1 попытка)
	_, err = s.repo.GetSubmission(ctx, s.db, hwID, userID)
	if err == nil {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrBadRequest.Wrap("homework has already been submitted and cannot be modified")
	} else if !s.db.IsNotFound(err) {
		log.Error("failed checking existing submission", liblogger.Err(err))
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	// 3. Получаем задачи этой работы и эталонные ответы к ним
	tasks, err := s.repo.GetHomeworkTasks(ctx, s.db, hwID)
	if err != nil {
		log.Error("failed get tasks", liblogger.Err(err))
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	taskIDs := make([]uuid.UUID, 0, len(tasks))
	for _, t := range tasks {
		taskIDs = append(taskIDs, t.ID)
	}

	allValidAnswers, err := s.repo.GetTaskAnswersByTaskIDs(ctx, s.db, taskIDs)
	if err != nil {
		log.Error("failed get answers for tasks", liblogger.Err(err))
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}

	validAnswersByTask := make(map[uuid.UUID][]answer_model.TaskAnswer, len(tasks))
	for _, va := range allValidAnswers {
		validAnswersByTask[va.TaskId] = append(validAnswersByTask[va.TaskId], va)
	}

	answersByUser := make(map[uuid.UUID]string, len(dto.Answers))
	for _, a := range dto.Answers {
		tid, parseErr := uuid.Parse(a.TaskID)
		if parseErr == nil {
			answersByUser[tid] = strings.TrimSpace(a.Answer)
		}
	}

	// 4. Автоматическая проверка всех задач ДЗ
	tx, err := s.db.TransactionBegin()
	if err != nil {
		return homework_dto.SubmissionResponseDTO{}, errs.ErrInternalError
	}
	defer tx.TransactionRollback()

	subID := uuid.New()
	totalScore := 0
	results := make([]submission_model.SubmissionTaskResult, 0, len(tasks))
	dtoResults := make([]homework_dto.TaskResultResponseDTO, 0, len(tasks))

	for _, tModel := range tasks {
		tID := tModel.ID
		userAnswerText := answersByUser[tID] // будет "", если пользователь не прислал ответ на задачу
		validAnswers := validAnswersByTask[tID]

		isCorrect := false
		normalizedUserAns := normalizeAnswer(userAnswerText)

		if normalizedUserAns != "" {
			for _, va := range validAnswers {
				if va.Correct && normalizeAnswer(va.Answer) == normalizedUserAns {
					isCorrect = true
					break
				}
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
			UserAnswer:    userAnswerText,
			IsCorrect:     isCorrect,
			PointsAwarded: score,
		})

		dtoResults = append(dtoResults, homework_dto.TaskResultResponseDTO{
			TaskID:        tID.String(),
			UserAnswer:    userAnswerText,
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

	sort.Slice(userScores, func(i, j int) bool {
		return userScores[i].TotalScore > userScores[j].TotalScore
	})

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
