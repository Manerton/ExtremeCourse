package refresh_repository

import (
	"context"
	"fmt"
	"main/internal/models/refresh_token"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type RefreshRepository struct{}

func (r *RefreshRepository) GetById(ctx context.Context, orm orm.ORM, id uuid.UUID) (refresh_token.RefreshToken, error) {
	const op = "repository.refresh_repository.GetById"

	resultToken := refresh_token.RefreshToken{ID: id}
	err := orm.First(ctx, refresh_token.RefreshToken{}, nil, &resultToken)
	if err != nil {
		return refresh_token.RefreshToken{}, fmt.Errorf("%s: %w", op, err)
	}

	return resultToken, nil
}

func (r *RefreshRepository) GetByDeviceId(ctx context.Context, orm orm.ORM, deviceId uuid.UUID) (refresh_token.RefreshToken, error) {
	const op = "repository.refresh_repository.GetByDeviceId"

	resultToken := refresh_token.RefreshToken{}
	err := orm.First(ctx, resultToken, nil, &resultToken, refresh_token.RefreshToken{DeviceId: deviceId})
	if err != nil {
		return refresh_token.RefreshToken{}, fmt.Errorf("%s: %w", op, err)
	}
	return resultToken, nil

}
func (r *RefreshRepository) GetByUserId(ctx context.Context, orm orm.ORM, userId uuid.UUID) ([]refresh_token.RefreshToken, error) {
	const op = "repository.refresh_repository.GetByUserId"

	resultsToken := []refresh_token.RefreshToken{}
	err := orm.Find(ctx, refresh_token.RefreshToken{}, nil, nil, nil, nil, nil, &resultsToken)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return resultsToken, nil
}

func (r *RefreshRepository) Create(ctx context.Context, orm orm.ORM, token refresh_token.RefreshToken) (uuid.UUID, error) {
	const op = "repository.refresh_repository.Create"

	err := orm.Create(ctx, &token)
	if err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", op, err)
	}

	return token.ID, nil
}

func (r *RefreshRepository) Update(ctx context.Context, orm orm.ORM, conditions *refresh_token.RefreshToken, token refresh_token.RefreshToken) error {
	const op = "repository.refresh_repository.Update"
	err := orm.Updates(ctx, conditions, &token)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (r *RefreshRepository) Delete(ctx context.Context, orm orm.ORM, id uuid.UUID) error {
	const op = "repository.refresh_reposiotry.Delete"

	modelDel := refresh_token.RefreshToken{ID: id}
	err := orm.Delete(ctx, modelDel)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}

	return nil
}
