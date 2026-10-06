package event_service

import (
	"context"
	"log/slog"
	"time"

	event_dto "main/internal/dto/event"
	"main/internal/lib/errs"
	"main/internal/lib/liblogger"
	"main/internal/lib/verification"
	models "main/internal/models/applications"
	event_model "main/internal/models/event"
	"main/internal/models/participant"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type EventRepository interface {
	Create(ctx context.Context, o orm.ORM, ev *event_model.Event) (uuid.UUID, error)
	GetByID(ctx context.Context, o orm.ORM, id uuid.UUID) (event_model.Event, error)
	GetAllOpen(ctx context.Context, o orm.ORM, offset, limit *int) ([]event_model.Event, error)
	UpdateStatus(ctx context.Context, o orm.ORM, id uuid.UUID, status int) error
}

type ApplicationRepository interface {
	Create(ctx context.Context, orm orm.ORM, application models.Application) (uuid.UUID, error)
	GetByID(ctx context.Context, orm orm.ORM, id uuid.UUID) (models.Application, error)
	GetAllByFilter(ctx context.Context, orm orm.ORM, filter models.Application, offset, limit *int, order *string) ([]models.Application, error)
	UpdateApplication(ctx context.Context, orm orm.ORM, application models.Application) error
}

type ParticipantRepository interface {
	GetByUserId(ctx context.Context, orm orm.ORM, userId uuid.UUID) (participant.Participant, error)
}

type EventService struct {
	db              orm.ORM
	log             *slog.Logger
	repo            EventRepository
	participantRepo ParticipantRepository
	appRepo         ApplicationRepository
}

func New(log *slog.Logger, db orm.ORM, repo EventRepository, appRepo ApplicationRepository, participantRepo ParticipantRepository) *EventService {
	return &EventService{
		db:              db,
		log:             log.With(slog.String("owner", "EventService")),
		repo:            repo,
		appRepo:         appRepo,
		participantRepo: participantRepo,
	}
}

func (s *EventService) CreateEvent(ctx context.Context, dto event_dto.CreateEventRequestDTO) (uuid.UUID, error) {
	const op = "services.EventService.CreateEvent"
	log := s.log.With(slog.String("op", op))

	ev := event_model.Event{
		ID:      uuid.New(),
		Name:    dto.Name,
		Subject: dto.Subject,
		Class:   dto.Class,
		Status:  event_model.EventStatusOpen,
	}

	id, err := s.repo.Create(ctx, s.db, &ev)
	if err != nil {
		log.Error("failed to create event", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError.Wrap("failed to create event")
	}
	return id, nil
}

func (s *EventService) GetAllOpen(ctx context.Context, page, limit *int) ([]event_dto.EventResponseDTO, error) {
	const op = "services.EventService.GetAllOpen"
	log := s.log.With(slog.String("op", op))

	var offset *int
	if page != nil && limit != nil {
		off := (*page - 1) * (*limit)
		offset = &off
	}

	events, err := s.repo.GetAllOpen(ctx, s.db, offset, limit)
	if err != nil {
		log.Error("failed to get open events", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed to get events")
	}

	res := make([]event_dto.EventResponseDTO, 0, len(events))
	for _, ev := range events {
		res = append(res, event_dto.EventResponseDTO{
			ID:      ev.ID.String(),
			Name:    ev.Name,
			Subject: ev.Subject,
			Class:   ev.Class,
			Status:  ev.Status,
		})
	}
	return res, nil
}

func (s *EventService) UpdateStatus(ctx context.Context, eventIDStr string, status int) error {
	const op = "services.EventService.UpdateStatus"
	log := s.log.With(slog.String("op", op))

	evID, err := uuid.Parse(eventIDStr)
	if err != nil {
		return errs.ErrBadRequest.Wrap("invalid event id")
	}

	if status != event_model.EventStatusOpen && status != event_model.EventStatusClosed {
		return errs.ErrBadRequest.Wrap("invalid event status")
	}

	if err := s.repo.UpdateStatus(ctx, s.db, evID, status); err != nil {
		log.Error("failed to update event status", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to update status")
	}
	return nil
}

func (s *EventService) ApplyToEvent(ctx context.Context, eventIDStr, userIDStr string) (uuid.UUID, error) {
	const op = "services.EventService.ApplyToEvent"
	log := s.log.With(slog.String("op", op))

	// 1. Проверка срока подачи заявок (до 12.10.2026)
	if time.Now().UTC().After(verification.RegistrationDeadline) {
		return uuid.Nil, errs.ErrBadRequest.Wrap("registration period has ended (deadline: 12.10.2026)")
	}

	evID, err := uuid.Parse(eventIDStr)
	if err != nil {
		return uuid.Nil, errs.ErrBadRequest.Wrap("invalid event id")
	}
	uID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.Nil, errs.ErrBadRequest.Wrap("invalid user id")
	}

	participant, err := s.participantRepo.GetByUserId(ctx, s.db, uID)
	if err != nil {
		if s.db.IsNotFound(err) {
			return uuid.Nil, errs.ErrBadRequest.Wrap("user not found")
		}
		log.Error("failed to get user", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError
	}

	ev, err := s.repo.GetByID(ctx, s.db, evID)
	if err != nil {
		if s.db.IsNotFound(err) {
			return uuid.Nil, errs.ErrBadRequest.Wrap("event not found")
		}
		log.Error("failed to get event", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError
	}

	if ev.Status != event_model.EventStatusOpen {
		return uuid.Nil, errs.ErrBadRequest.Wrap("event registration is closed")
	}

	if participant.ClassNumber > ev.Class {
		log.Error("user class lower than event", slog.Int("user class", participant.ClassNumber), slog.Int("event class", ev.Class))
		return uuid.Nil, errs.ErrBadRequest.Wrap("user not allowed")
	}

	// 2. Проверка: у пользователя не должно быть ДРУГИХ активных заявок
	// Ищем все заявки данного пользователя (без привязки к EventID)
	userApplications, err := s.appRepo.GetAllByFilter(ctx, s.db, models.Application{
		UserID: uID,
	}, nil, nil, nil)
	if err != nil {
		log.Error("failed to check existing user applications", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError
	}

	// Проверяем, есть ли среди них активная (Approved, Pending и т.д.)
	for _, app := range userApplications {
		// Считаем заявку активной, если её статус Approved
		if app.Status == models.ApprovedStatus {
			return uuid.Nil, errs.ErrBadRequest.Wrap("you already have an active application; cancel it before applying to a new event")
		}
	}

	app := models.Application{
		UserID:             uID,
		SchoolID:           participant.SchoolId, // если в модели участника поле называется SchoolId
		EventID:            evID,
		ClassParticipation: ev.Class,
		Status:             models.ApprovedStatus,
	}

	appID, err := s.appRepo.Create(ctx, s.db, app)
	if err != nil {
		log.Error("failed to create application", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError.Wrap("failed to create application")
	}

	return appID, nil
}

func (s *EventService) ReviewApplication(ctx context.Context, appIDStr string, status int) error {
	const op = "services.EventService.ReviewApplication"
	log := s.log.With(slog.String("op", op))

	appID, err := uuid.Parse(appIDStr)
	if err != nil {
		return errs.ErrBadRequest.Wrap("invalid application id")
	}

	if status != models.ApprovedStatus && status != models.RejectedStatus {
		return errs.ErrBadRequest.Wrap("status must be approved (2) or rejected (3)")
	}

	app, err := s.appRepo.GetByID(ctx, s.db, appID)
	if err != nil {
		if s.db.IsNotFound(err) {
			return errs.ErrBadRequest.Wrap("application not found")
		}
		log.Error("failed to find application", liblogger.Err(err))
		return errs.ErrInternalError
	}

	app.Status = status
	if err := s.appRepo.UpdateApplication(ctx, s.db, app); err != nil {
		log.Error("failed to update application status", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to review application")
	}

	return nil
}
