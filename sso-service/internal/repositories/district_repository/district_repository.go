package district_repository

import (
	"context"
	"fmt"
	"main/internal/dictionary/region_dictionary"
	"main/internal/models/district"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type DistrictRepository struct {
}

func New() *DistrictRepository {
	return &DistrictRepository{}
}

func (r *DistrictRepository) GetAllByRegion(ctx context.Context, orm orm.ORM, region int) ([]district.District, error) {
	const op = "repository.DistrictRepository.GetAllByRegion"
	result := []district.District{}
	err := orm.Find(ctx, district.District{}, nil, nil, nil, nil, nil, &result, district.District{Region: region_dictionary.RegionID(region)})
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return result, nil
}

func (r *DistrictRepository) GetByID(ctx context.Context, orm orm.ORM, id uuid.UUID) (district.District, error) {
	const op = "repository.DistrictRepository.GetByID"
	result := district.District{}
	err := orm.First(ctx, district.District{}, nil, &result, district.District{ID: id})
	if err != nil {
		return district.District{}, fmt.Errorf("%s: %w", op, err)
	}

	return result, nil
}
