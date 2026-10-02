package user_repository

import (
	"context"
	"fmt"
	"main/internal/models/user"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type UserRepository struct{}

func (r *UserRepository) GetCount(ctx context.Context, orm orm.ORM) (int64, error) {
	const op = "repositories.UserRepository.GetCount"

	var countResult int64 = 0
	err := orm.Count(ctx, user.User{}, &countResult, nil)
	if err != nil {
		return 0, fmt.Errorf("%s: %w", op, err)
	}

	return countResult, nil
}

func (r *UserRepository) GetAll(ctx context.Context, orm orm.ORM, offset *int, limit *int) ([]user.User, error) {
	const op = "repositories.UserRepository.GetAll"

	userResult := []user.User{}
	err := orm.Find(ctx, user.User{}, nil, nil, offset, limit, nil, &userResult)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return userResult, nil
}

func (r *UserRepository) GetByFilter(ctx context.Context, orm orm.ORM, userModel user.User) (user.User, error) {
	const op = "repositories.UserRepository.GetByFilter"

	userResult := user.User{}
	err := orm.First(ctx, user.User{}, nil, &userResult, userModel)
	if err != nil {
		return user.User{}, fmt.Errorf("%s: %w", op, err)
	}
	return userResult, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, orm orm.ORM, email string) (user.User, error) {
	const op = "repositories.UserRepository.GetByEmail"

	userResult := user.User{}
	err := orm.First(ctx, user.User{}, nil, &userResult, user.User{Email: email})

	if err != nil {
		return user.User{}, fmt.Errorf("%s: %w", op, err)
	}

	return userResult, nil
}

func (r *UserRepository) GetById(ctx context.Context, orm orm.ORM, id uuid.UUID) (user.User, error) {
	const op = "repositories.UserRepository.GetById"

	userResult := user.User{}
	err := orm.First(ctx, user.User{}, nil, &userResult, user.User{ID: id})
	if err != nil {
		return user.User{}, fmt.Errorf("%s: %w", op, err)
	}
	return userResult, nil
}

func (r *UserRepository) GetByRole(ctx context.Context, orm orm.ORM, role user.RoleType) ([]user.User, error) {
	const op = "repositories.UserRepository.GetByRole"

	usersResult := []user.User{}
	err := orm.Find(ctx, user.User{}, nil, nil, nil, nil, nil, &usersResult, user.User{Role: role})
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return usersResult, nil
}

func (r *UserRepository) GetByListId(ctx context.Context, orm orm.ORM, ids []uuid.UUID) ([]user.User, error) {
	const op = "repositories.UserRepository.GetByListId"
	userResult := []user.User{}
	err := orm.Find(ctx, user.User{}, nil, nil, nil, nil, nil, &userResult, ids)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return userResult, nil
}

func (r *UserRepository) Create(ctx context.Context, orm orm.ORM, user user.User) (uuid.UUID, error) {
	const op = "repositories.UserRepository.Create"

	err := orm.Create(ctx, &user)
	if err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", op, err)
	}
	return user.ID, nil
}

func (r *UserRepository) Update(ctx context.Context, orm orm.ORM, user user.User) error {
	const op = "repositories.use_repository.Update"
	err := orm.Updates(ctx, nil, &user)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (r *UserRepository) Delete(ctx context.Context, orm orm.ORM, id uuid.UUID) error {
	const op = "repositories.user_repository.Delete"
	err := orm.Delete(ctx, &user.User{ID: id})
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
