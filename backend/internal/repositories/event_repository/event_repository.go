package event_repository

import (
	"context"
	"fmt"

	event_model "main/internal/models/event"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type EventRepository struct{}

func New() *EventRepository {
	return &EventRepository{}
}

func (r *EventRepository) Create(ctx context.Context, o orm.ORM, ev *event_model.Event) (uuid.UUID, error) {
	const op = "repositories.EventRepository.Create"
	if err := o.Create(ctx, ev); err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", op, err)
	}
	return ev.ID, nil
}

func (r *EventRepository) GetByID(ctx context.Context, o orm.ORM, id uuid.UUID) (event_model.Event, error) {
	const op = "repositories.EventRepository.GetByID"
	var ev event_model.Event
	err := o.First(ctx, event_model.Event{}, nil, &ev, event_model.Event{ID: id})
	if err != nil {
		return event_model.Event{}, fmt.Errorf("%s: %w", op, err)
	}
	return ev, nil
}

func (r *EventRepository) GetByListId(ctx context.Context, o orm.ORM, ids []uuid.UUID) ([]event_model.Event, error) {
	const op = "repositories.EventRepository.GetByListId"
	if len(ids) == 0 {
		return []event_model.Event{}, nil
	}

	var events []event_model.Event
	err := o.Find(ctx, event_model.Event{}, nil, nil, nil, nil, nil, &events, "id IN ?", ids)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return events, nil
}

func (r *EventRepository) GetAllOpen(ctx context.Context, o orm.ORM, offset, limit *int) ([]event_model.Event, error) {
	const op = "repositories.EventRepository.GetAllOpen"
	var events []event_model.Event
	err := o.Find(ctx, event_model.Event{}, nil, nil, offset, limit, nil, &events, event_model.Event{Status: event_model.EventStatusOpen})
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return events, nil
}

func (r *EventRepository) UpdateStatus(ctx context.Context, o orm.ORM, id uuid.UUID, status int) error {
	const op = "repositories.EventRepository.UpdateStatus"
	err := o.Updates(ctx, event_model.Event{ID: id}, event_model.Event{Status: status})
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
