package school_repository

import (
	"context"
	"fmt"
	"main/internal/models/school"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type SchoolRepository struct{}

func (r *SchoolRepository) GetCount(ctx context.Context, orm orm.ORM) (int64, error) {
	const op = "repositories.SchoolRepository.GetCount"

	var countResult int64 = 0
	err := orm.Count(ctx, school.School{}, &countResult, nil)
	if err != nil {
		return 0, fmt.Errorf("%s: %w", op, err)
	}

	return countResult, nil
}

func (r *SchoolRepository) GetById(ctx context.Context, orm orm.ORM, id uuid.UUID) (school.School, error) {
	const op = "repositories.SchoolRepository.GetById"

	schoolResult := school.School{}
	err := orm.First(ctx, school.School{}, nil, &schoolResult, school.School{ID: id})
	if err != nil {
		return school.School{}, fmt.Errorf("%s: %w", op, err)
	}
	return schoolResult, nil
}

func (r *SchoolRepository) GetAll(ctx context.Context, orm orm.ORM, offset, limit *int) ([]school.School, error) {
	const op = "repositories.SchoolRepository.GetAll"

	schoolsResult := []school.School{}
	err := orm.Find(ctx, school.School{}, nil, nil, offset, limit, nil, &schoolsResult, nil)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return schoolsResult, nil
}

func (r *SchoolRepository) GetAllByDistrict(ctx context.Context, orm orm.ORM, districtId uuid.UUID) ([]school.School, error) {
	const op = "repositories.SchoolRepository.GetAllByDistrict"

	schoolResult := []school.School{}
	err := orm.Find(ctx, school.School{}, nil, nil, nil, nil, nil, &schoolResult, school.School{DistrictID: districtId})
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return schoolResult, nil
}

func (r *SchoolRepository) Create(ctx context.Context, orm orm.ORM, school school.School) (uuid.UUID, error) {
	const op = "repositories.SchoolRepository.Create"

	err := orm.Create(ctx, &school)
	if err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", op, err)
	}
	return school.ID, nil
}

func (r *SchoolRepository) Update(ctx context.Context, orm orm.ORM, school school.School) error {
	const op = "repositories.SchoolRepository.Update"

	err := orm.Updates(ctx, nil, &school)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (r *SchoolRepository) Delete(ctx context.Context, orm orm.ORM, id uuid.UUID) error {
	const op = "repositories.SchoolRepository.Delete"

	err := orm.Delete(ctx, &school.School{ID: id})
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
