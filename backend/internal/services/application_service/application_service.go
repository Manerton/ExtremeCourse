package application_service

import (
	"context"
	"fmt"
	ApplicationDto "main/internal/dto/applications"
	models "main/internal/models/applications"
	"main/internal/storage/orm"

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

type ApplicationService struct {
	db         orm.ORM
	repository ApplicationRepository
}

func NewApplicationService(db orm.ORM, repo ApplicationRepository) *ApplicationService {
	return &ApplicationService{
		db:         db,
		repository: repo,
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

// Получение всех заявок пользователя
func (s *ApplicationService) GetApplicationsByUserID(ctx context.Context, userid string, page *int, limit *int) ([]ApplicationDto.ApplicationResponseDTO, error) {
	const op = "services.application_service.GetApplicationsByUserID"
	const errMsg = "failed to find applications by userid"
	uid, err := uuid.Parse(userid)
	if err != nil {
		return []ApplicationDto.ApplicationResponseDTO{}, fmt.Errorf("%s", errMsg)
	}

	offset := new(int)
	if page != nil && limit != nil {
		*offset = (*page - 1) * (*limit)
	}

	// Получаем заявки из репозитория
	applications, err := s.repository.GetApplicationsByUserID(ctx, s.db, uid, offset, limit)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	// Конвертируем в DTO перед передачей
	return ConvertManyApplicationsToDTO(applications), nil
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
