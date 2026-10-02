package participant_repository

import (
	"context"
	"fmt"
	"main/internal/models/participant"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type ParticipantRepository struct{}

func (r *ParticipantRepository) GetCount(ctx context.Context, orm orm.ORM) (int64, error) {
	const op = "repositories.ParticipantRepository.GetCount"

	var countResult int64 = 0
	err := orm.Count(ctx, participant.Participant{}, &countResult, nil)
	if err != nil {
		return 0, fmt.Errorf("%s: %w", op, err)
	}

	return countResult, nil
}

func (r *ParticipantRepository) GetById(ctx context.Context, orm orm.ORM, id uuid.UUID) (participant.Participant, error) {
	const op = "repositories.participant_repository.GetById"

	participantRes := participant.Participant{ID: id}
	err := orm.First(ctx, participant.Participant{}, nil, &participantRes)
	if err != nil {
		return participant.Participant{}, fmt.Errorf("%s: %w", op, err)
	}
	return participantRes, nil
}

func (r *ParticipantRepository) GetAll(ctx context.Context, orm orm.ORM, offset, limit *int) ([]participant.Participant, error) {
	const op = "repositories.participant_repository.GetAll"

	participantRes := []participant.Participant{}
	err := orm.Find(ctx, participant.Participant{}, nil, nil, offset, limit, nil, &participantRes)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return participantRes, nil
}

func (r *ParticipantRepository) GetByUserId(ctx context.Context, orm orm.ORM, userId uuid.UUID) (participant.Participant, error) {
	const op = "repositories.participant_repository.GetByUserId"

	participantRes := participant.Participant{}
	err := orm.First(ctx, participant.Participant{}, nil, &participantRes, participant.Participant{UserId: userId})

	if err != nil {
		return participant.Participant{}, fmt.Errorf("%s: %w", op, err)
	}
	return participantRes, nil
}

func (r *ParticipantRepository) GetByUserIdListWithPreload(ctx context.Context, orm orm.ORM, ids []uuid.UUID) ([]participant.Participant, error) {
	const op = "repositories.participant_repository.GetByUserIdListWithPreload"
	participants := []participant.Participant{}
	preload := "User"
	err := orm.AdvancedFind(ctx, participant.Participant{}, "user_id IN ?", ids, &preload, &participants)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return participants, nil
}

func (r *ParticipantRepository) Create(ctx context.Context, orm orm.ORM, participant participant.Participant) (uuid.UUID, error) {
	const op = "repositories.participant_repository.Create"

	err := orm.Create(ctx, &participant)
	if err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", op, err)
	}

	return participant.ID, nil
}

func (r *ParticipantRepository) Update(ctx context.Context, orm orm.ORM, participant participant.Participant) error {
	const op = "repositories.participant_repository.Update"

	err := orm.Updates(ctx, nil, &participant)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (r *ParticipantRepository) Delete(ctx context.Context, orm orm.ORM, id uuid.UUID) error {
	const op = "repositories.participant_repository.Delete"

	err := orm.Delete(ctx, &participant.Participant{ID: id})
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
