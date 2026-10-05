package application_service

import (
	"context"
	"fmt"
	"log/slog"
	ApplicationDto "main/internal/dto/applications"
	"main/internal/lib/errs"
	"main/internal/lib/liblogger"
	"main/internal/lib/verification"
	models "main/internal/models/applications"
	"main/internal/models/event"
	"main/internal/models/school"
	"main/internal/models/user"
	"main/internal/storage/orm"
	"strings"
	"time"

	"github.com/google/uuid"
)

type ApplicationRepository interface {
	Create(ctx context.Context, orm orm.ORM, application models.Application) (uuid.UUID, error)
	GetByID(ctx context.Context, orm orm.ORM, id uuid.UUID) (models.Application, error)
	GetAllByFilter(ctx context.Context, orm orm.ORM, filter models.Application, offset, limit *int, order *string) ([]models.Application, error)
	GetAllApplications(ctx context.Context, orm orm.ORM, offset *int, limit *int) ([]models.Application, error)
	GetApplicationsByUserID(ctx context.Context, orm orm.ORM, userID uuid.UUID, offset *int, limit *int) ([]models.Application, error)
	GetApplicationsByEventID(ctx context.Context, orm orm.ORM, eventID uuid.UUID, offset *int, limit *int) ([]models.Application, error)
	GetApplicationsBySchoolID(ctx context.Context, orm orm.ORM, schoolID uuid.UUID, offset *int, limit *int) ([]models.Application, error)
	GetApprovedApplicationsByEventID(ctx context.Context, orm orm.ORM, eventId uuid.UUID) ([]models.Application, error)
	GetApplicationsBySchoolListID(ctx context.Context, orm orm.ORM, ids []uuid.UUID) ([]models.Application, error)
	UpdateApplication(ctx context.Context, orm orm.ORM, application models.Application) error
	DeleteApplicationByID(ctx context.Context, orm orm.ORM, id uuid.UUID) error
	DeleteByFilter(ctx context.Context, orm orm.ORM, model models.Application) error
	GetCount(ctx context.Context, orm orm.ORM) (int64, error)
}

type UserRepository interface {
	GetByListId(ctx context.Context, orm orm.ORM, ids []uuid.UUID) ([]user.User, error)
}

type SchoolRepository interface {
	GetByListId(ctx context.Context, orm orm.ORM, ids []uuid.UUID) ([]school.School, error)
}

type EventRepository interface {
	GetByListId(ctx context.Context, o orm.ORM, ids []uuid.UUID) ([]event.Event, error)
}

type ApplicationService struct {
	db         orm.ORM
	log        *slog.Logger
	repository ApplicationRepository
	userRepo   UserRepository
	schoolRepo SchoolRepository
	eventRepo  EventRepository
}

func NewApplicationService(log *slog.Logger, db orm.ORM, repo ApplicationRepository,
	userRepo UserRepository,
	schoolRepo SchoolRepository,
	eventRepo EventRepository) *ApplicationService {
	return &ApplicationService{
		db:         db,
		log:        log,
		repository: repo,
		userRepo:   userRepo,
		schoolRepo: schoolRepo,
		eventRepo:  eventRepo,
	}
}

// Получение всех заявок по фильтру
func (s *ApplicationService) GetAllByFilter(ctx context.Context, filterModel ApplicationDto.ApplicationResponseDTO, page *int, limit *int, order string) ([]ApplicationDto.ApplicationResponseDTO, error) {
	const op = "services.application_service.GetAllApplications"

	offset := new(int)
	if page != nil && limit != nil {
		*offset = (*page - 1) * (*limit)
	}

	filter := ConvertFullDTOtoApplication(filterModel)

	applications, err := s.repository.GetAllByFilter(ctx, s.db, filter, offset, limit, &order)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return ConvertManyApplicationsToDTO(applications), nil
}

// Получение всех заявок
func (s *ApplicationService) GetCount(ctx context.Context) (int64, error) {
	const op = "services.user_services.GetCount"

	userCount, err := s.repository.GetCount(ctx, s.db)
	if err != nil {
		return 0, fmt.Errorf("%s: %w", op, err)
	}

	return userCount, nil
}

// Получение всех заявок
func (s *ApplicationService) GetAllApplications(ctx context.Context, page *int, limit *int) ([]ApplicationDto.ApplicationResponseDTO, error) {
	const op = "services.application_service.GetAllApplications"

	offset := new(int)
	if page != nil && limit != nil {
		*offset = (*page - 1) * (*limit)
	}

	applications, err := s.repository.GetAllApplications(ctx, s.db, offset, limit)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return ConvertManyApplicationsToDTO(applications), nil
}

// Получение заявки по ID
func (s *ApplicationService) GetApplicationByID(ctx context.Context, id string) (ApplicationDto.ApplicationResponseDTO, error) {
	const op = "services.application_service.GetApplicationByID"
	const errMsg = "failed to find application"
	uid, err := uuid.Parse(id)
	if err != nil {
		return ApplicationDto.ApplicationResponseDTO{}, fmt.Errorf("%s", errMsg)
	}

	application, err := s.repository.GetByID(ctx, s.db, uid)
	if err != nil {
		return ApplicationDto.ApplicationResponseDTO{}, fmt.Errorf("%s: %w", op, err)
	}
	return ConvertApplicationToDTO(application), nil
}

func (s *ApplicationService) GetApplicationsByUserID(ctx context.Context, userid string) ([]ApplicationDto.ApplicationResponseDTO, error) {
	const op = "services.application_service.GetApplicationsByUserID"

	uid, err := uuid.Parse(userid)
	if err != nil {
		return nil, fmt.Errorf("%s: invalid user id: %w", op, err)
	}

	// 1. Получаем заявки
	applications, err := s.repository.GetApplicationsByUserID(ctx, s.db, uid, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	if len(applications) == 0 {
		return []ApplicationDto.ApplicationResponseDTO{}, nil
	}

	// 2. Собираем уникальные EventID
	eventIDsMap := make(map[uuid.UUID]struct{})
	for _, app := range applications {
		eventIDsMap[app.EventID] = struct{}{}
	}

	eventIDs := make([]uuid.UUID, 0, len(eventIDsMap))
	for id := range eventIDsMap {
		eventIDs = append(eventIDs, id)
	}

	// 3. Запрашиваем все события одним запросом (батчем)
	events, err := s.eventRepo.GetByListId(ctx, s.db, eventIDs)
	if err != nil {
		return nil, fmt.Errorf("%s: failed to fetch events: %w", op, err)
	}

	// 4. Индексируем события по ID для быстрого O(1) поиска
	eventsMap := make(map[uuid.UUID]event.Event, len(events))
	for _, ev := range events {
		eventsMap[ev.ID] = ev
	}

	// 5. Конвертируем с привязкой событий
	return ConvertManyApplicationsToDTONew(applications, eventsMap), nil
}

// Получение всех заявок события
func (s *ApplicationService) GetApplicationsByEventID(ctx context.Context, eventID string, page *int, limit *int) ([]ApplicationDto.ApplicationResponseDTO, error) {
	const op = "services.application_service.GetApplicationsByEventID"
	const errMsg = "failed to find applications by EventId"
	uid, err := uuid.Parse(eventID)
	if err != nil {
		return []ApplicationDto.ApplicationResponseDTO{}, fmt.Errorf("%s", errMsg)
	}

	offset := new(int)
	if page != nil && limit != nil {
		*offset = (*page - 1) * (*limit)
	}

	// Получаем заявки из репозитория
	applications, err := s.repository.GetApplicationsByEventID(ctx, s.db, uid, offset, limit)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	// Конвертируем в DTO перед передачей
	return ConvertManyApplicationsToDTO(applications), nil
}

// Получение всех заявок события
func (s *ApplicationService) GetApplicationsBySchoolID(ctx context.Context, schoolID string, page *int, limit *int) ([]ApplicationDto.ApplicationResponseDTO, error) {
	const op = "services.application_service.GetApplicationsBySchoolID"
	const errMsg = "failed to find applications by SchoolID"
	uid, err := uuid.Parse(schoolID)
	if err != nil {
		return []ApplicationDto.ApplicationResponseDTO{}, fmt.Errorf("%s", errMsg)
	}

	offset := new(int)
	if page != nil && limit != nil {
		*offset = (*page - 1) * (*limit)
	}

	// Получаем заявки из репозитория
	applications, err := s.repository.GetApplicationsBySchoolID(ctx, s.db, uid, offset, limit)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	// Конвертируем в DTO перед передачей
	return ConvertManyApplicationsToDTO(applications), nil
}

// Получение всех заявок по спискн
func (s *ApplicationService) GetApplicationsBySchoolListID(ctx context.Context, ids []string) ([]ApplicationDto.ApplicationResponseDTO, error) {
	const op = "services.application_service.GetApplicationsBySchoolListID"
	const errMsg = "failed to find applications by SchoolListID"
	uids := make([]uuid.UUID, 0, len(ids))
	for _, id := range ids {
		uid, err := uuid.Parse(id)
		if err != nil {
			return nil, fmt.Errorf("%s: %s", op, "failed parse id")
		}
		uids = append(uids, uid)
	}

	applications, err := s.repository.GetApplicationsBySchoolListID(ctx, s.db, uids)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return ConvertManyApplicationsToDTO(applications), nil
}

func (s *ApplicationService) SetParticipantCode(ctx context.Context, eventIDStr string) error {
	const op = "services.application_service.SetParticipantCode"
	eventUId, err := uuid.Parse(eventIDStr)
	if err != nil {
		return fmt.Errorf("%s: %s", op, "failed parse id")
	}

	// Только одобренные
	// applications, err := s.repository.GetApprovedApplicationsByEventID(ctx, s.db, eventUId)

	// Все, временно
	applications, err := s.repository.GetApplicationsByEventID(ctx, s.db, eventUId, nil, nil)
	if err != nil {
		return fmt.Errorf("%s: %s", op, "failde get applications by event id")
	}

	transactionBegin, err := s.db.TransactionBegin()
	if err != nil {
		return fmt.Errorf("%s: %s", op, "failed begin transaction")
	}

	classGroupMap := make(map[int][]models.Application)
	for _, application := range applications {
		classGroupMap[application.ClassParticipation] = append(classGroupMap[application.ClassParticipation], application)
	}

	for _, groupApp := range classGroupMap {
		for _, application := range groupApp {

			err := s.repository.UpdateApplication(ctx, transactionBegin, application)
			if err != nil {
				transactionBegin.TransactionRollback()
				return fmt.Errorf("%s: %s", op, "failed update application")
			}
		}
	}

	transactionBegin.TransactionCommit()
	return nil
}

// Создание новой заявки
func (s *ApplicationService) CreateApplication(ctx context.Context, applicationDTO ApplicationDto.CreateApplicationDTO) (uuid.UUID, error) {
	const op = "services.application_service.CreateApplication"
	application := ConvertDTOtoApplication(applicationDTO)
	uid, err := s.repository.Create(ctx, s.db, application)
	if err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", op, err)
	}
	return uid, nil
}

// Обновление статуса заявки
func (s *ApplicationService) UpdateApplication(ctx context.Context, id string, statusDTO ApplicationDto.UpdateApplicationDTO) error {
	const op = "services.application_service.UpdateApplicationStatus"

	uid, err := uuid.Parse(string(id))
	if err != nil {
		return fmt.Errorf("%s", err)
	}
	statusApp := ConvertUpdateDTOtoApplication(uid, statusDTO)
	if err := s.repository.UpdateApplication(ctx, s.db, statusApp); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

// Удаление заявки по ID
func (s *ApplicationService) DeleteApplication(ctx context.Context, id string) error {
	const op = "services.application_service.DeleteApplication"
	const errMsg = "failed delete application"
	uid, err := uuid.Parse(string(id))
	if err != nil {
		return fmt.Errorf("%s", errMsg)
	}

	if err := s.repository.DeleteApplicationByID(ctx, s.db, uid); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (s *ApplicationService) DeleteByFilter(ctx context.Context, deleteDTO ApplicationDto.DeleteApplicationDTO) error {
	const op = "services.application_service.DeleteByFilter"

	model := ConvertDeleteDTOtoApplication(deleteDTO)
	if err := s.repository.DeleteByFilter(ctx, s.db, model); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}

	return nil
}

func (s *ApplicationService) GetAllFullApplications(ctx context.Context, page, limit *int) ([]ApplicationDto.FullApplicationDetailsDTO, error) {
	const op = "services.FullApplicationService.GetAllFullApplications"
	log := s.log.With(slog.String("op", op))

	offset := new(int)
	if page != nil && limit != nil {
		*offset = (*page - 1) * (*limit)
	}

	apps, err := s.repository.GetAllApplications(ctx, s.db, offset, limit)
	if err != nil {
		log.Error("failed get applications", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed get applications")
	}

	if len(apps) == 0 {
		return []ApplicationDto.FullApplicationDetailsDTO{}, nil
	}

	userMapIDs := make(map[uuid.UUID]bool)
	schoolMapIDs := make(map[uuid.UUID]bool)
	eventMapIDs := make(map[uuid.UUID]bool)

	for _, app := range apps {
		userMapIDs[app.UserID] = true
		schoolMapIDs[app.SchoolID] = true
		eventMapIDs[app.EventID] = true
	}

	userIDs := make([]uuid.UUID, 0, len(userMapIDs))
	for id := range userMapIDs {
		userIDs = append(userIDs, id)
	}
	schoolIDs := make([]uuid.UUID, 0, len(schoolMapIDs))
	for id := range schoolMapIDs {
		schoolIDs = append(schoolIDs, id)
	}
	eventIDs := make([]uuid.UUID, 0, len(eventMapIDs))
	for id := range eventMapIDs {
		eventIDs = append(eventIDs, id)
	}

	users, err := s.userRepo.GetByListId(ctx, s.db, userIDs)
	if err != nil {
		log.Error("failed get users", liblogger.Err(err))
		return nil, errs.ErrInternalError
	}
	userMap := make(map[uuid.UUID]user.User, len(users))
	for _, u := range users {
		userMap[u.ID] = u
	}

	schools, err := s.schoolRepo.GetByListId(ctx, s.db, schoolIDs)
	if err != nil {
		log.Error("failed get schools", liblogger.Err(err))
		return nil, errs.ErrInternalError
	}
	schoolMap := make(map[uuid.UUID]school.School, len(schools))
	for _, sc := range schools {
		schoolMap[sc.ID] = sc
	}

	events, err := s.eventRepo.GetByListId(ctx, s.db, eventIDs)
	if err != nil {
		log.Error("failed get events", liblogger.Err(err))
		return nil, errs.ErrInternalError
	}
	eventMap := make(map[uuid.UUID]event.Event, len(events))
	for _, ev := range events {
		eventMap[ev.ID] = ev
	}

	res := make([]ApplicationDto.FullApplicationDetailsDTO, 0, len(apps))
	for _, app := range apps {
		u := userMap[app.UserID]
		sc := schoolMap[app.SchoolID]
		ev := eventMap[app.EventID]

		fullName := strings.TrimSpace(u.Surname + " " + u.Firstname + " " + u.Patronymic)
		if fullName == "" {
			fullName = u.Email
		}

		res = append(res, ApplicationDto.FullApplicationDetailsDTO{
			ID:                 app.ID.String(),
			Status:             app.Status,
			ClassParticipation: app.ClassParticipation,
			SubmittedAt:        app.SubmittedAt,
			UpdatedAt:          app.UpdatedAt,
			User: ApplicationDto.UserDetailsDTO{
				ID:          u.ID.String(),
				Email:       u.Email,
				FullName:    fullName,
				PhoneNumber: u.PhoneNumber,
				BirthDate:   u.BirthDate,
			},
			School: ApplicationDto.SchoolDetailsDTO{
				ID:         sc.ID.String(),
				FullName:   sc.FullName,
				Name:       sc.Name,
				DistrictID: sc.DistrictID.String(),
			},
			Event: ApplicationDto.EventDetailsDTO{
				ID:      ev.ID.String(),
				Name:    ev.Name,
				Subject: ev.Subject,
				Class:   ev.Class,
				Status:  ev.Status,
			},
		})
	}

	return res, nil
}

func (s *ApplicationService) ReviewApplication(ctx context.Context, appIDStr string, status int) error {
	const op = "services.FullApplicationService.ReviewApplication"
	log := s.log.With(slog.String("op", op))

	appID, err := uuid.Parse(appIDStr)
	if err != nil {
		return errs.ErrBadRequest.Wrap("invalid application id")
	}

	if status != models.ApprovedStatus && status != models.RejectedStatus {
		return errs.ErrBadRequest.Wrap("status must be 2 (approved) or 3 (rejected)")
	}

	app, err := s.repository.GetByID(ctx, s.db, appID)
	if err != nil {
		if s.db.IsNotFound(err) {
			return errs.ErrBadRequest.Wrap("application not found")
		}
		log.Error("failed get application", liblogger.Err(err))
		return errs.ErrInternalError
	}

	app.Status = status
	if err := s.repository.UpdateApplication(ctx, s.db, app); err != nil {
		log.Error("failed update application status", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed review application")
	}

	return nil
}

func (s *ApplicationService) CancelApplication(ctx context.Context, appIDStr string) error {
	const op = "services.EventService.CancelApplication"
	log := s.log.With(slog.String("op", op))

	// Проверка дедлайна на отзыв
	if time.Now().UTC().After(verification.RegistrationDeadline) {
		return errs.ErrBadRequest.Wrap("cancellation period has ended (deadline: 12.10.2026)")
	}

	appID, err := uuid.Parse(appIDStr)
	if err != nil {
		return errs.ErrBadRequest.Wrap("invalid application id")
	}

	// Обновляем статус заявки на models.CancelledStatus (например, 4)
	applicationUpdate := models.Application{
		ID:     appID,
		Status: models.RejectedStatus,
	}

	err = s.repository.UpdateApplication(ctx, s.db, applicationUpdate)
	if err != nil {
		log.Error("failed to cancel application", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to cancel application")
	}

	return nil
}

// Функции для преобразования между DTO и моделью

func ConvertDTOtoApplication(dto ApplicationDto.CreateApplicationDTO) models.Application {

	userUid, _ := uuid.Parse(dto.UserID)
	eventUid, _ := uuid.Parse(dto.EventID)
	schoolUid, _ := uuid.Parse(dto.SchoolID)

	return models.Application{
		UserID:             userUid,
		EventID:            eventUid,
		SchoolID:           schoolUid,
		ClassParticipation: dto.ClassParticipation,
	}
}

func ConvertDeleteDTOtoApplication(dto ApplicationDto.DeleteApplicationDTO) models.Application {
	return models.Application{
		ID:       dto.ID,
		UserID:   dto.UserID,
		EventID:  dto.EventID,
		SchoolID: dto.SchoolID,
	}
}

func ConvertFullDTOtoApplication(dto ApplicationDto.ApplicationResponseDTO) models.Application {
	return models.Application{
		ID:       dto.ID,
		UserID:   dto.UserID,
		EventID:  dto.EventID,
		SchoolID: dto.SchoolID,
		//EventName:     application.EventName,
		//EventLocation: application.EventLocation,
		//EventDate:     application.EventDate,
		Status:      dto.Status,
		SubmittedAt: dto.SubmittedAt,
		UpdatedAt:   dto.UpdatedAt,
	}
}

func ConvertUpdateDTOtoApplication(id uuid.UUID, dto ApplicationDto.UpdateApplicationDTO) models.Application {
	return models.Application{
		ID:     id,
		Status: dto.Status,
	}
}

func ConvertApplicationToDTO(application models.Application) ApplicationDto.ApplicationResponseDTO {
	return ApplicationDto.ApplicationResponseDTO{
		ID:       application.ID,
		UserID:   application.UserID,
		EventID:  application.EventID,
		SchoolID: application.SchoolID,
		//EventName:     application.EventName,
		//EventLocation: application.EventLocation,
		//EventDate:     application.EventDate,
		ClassParticipation: application.ClassParticipation,
		Status:             application.Status,

		SubmittedAt: application.SubmittedAt,
		UpdatedAt:   application.UpdatedAt,
	}
}

func ConvertManyApplicationsToDTO(applications []models.Application) []ApplicationDto.ApplicationResponseDTO {
	var applicationsDTO []ApplicationDto.ApplicationResponseDTO
	for _, application := range applications {
		applicationsDTO = append(applicationsDTO, ConvertApplicationToDTO(application))
	}
	return applicationsDTO
}

func ConvertApplicationToDTONew(application models.Application, event event.Event) ApplicationDto.ApplicationResponseDTO {
	return ApplicationDto.ApplicationResponseDTO{
		ID:                 application.ID,
		UserID:             application.UserID,
		EventName:          event.Name,
		EventID:            event.ID,
		SchoolID:           application.SchoolID,
		ClassParticipation: application.ClassParticipation,
		Status:             application.Status,
		SubmittedAt:        application.SubmittedAt,
		UpdatedAt:          application.UpdatedAt,
	}
}

func ConvertManyApplicationsToDTONew(applications []models.Application, eventsMap map[uuid.UUID]event.Event) []ApplicationDto.ApplicationResponseDTO {
	applicationsDTO := make([]ApplicationDto.ApplicationResponseDTO, 0, len(applications))
	for _, application := range applications {
		event := eventsMap[application.EventID]
		applicationsDTO = append(applicationsDTO, ConvertApplicationToDTONew(application, event))
	}
	return applicationsDTO
}
