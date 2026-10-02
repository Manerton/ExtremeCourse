package district_service

import (
	"context"
	"log/slog"
	district_dto "main/internal/dto/district"
	"main/internal/lib/errs"
	"main/internal/lib/liblogger"
	"main/internal/lib/mapper/district_mapper"
	"main/internal/models/district"
	"main/internal/storage/orm"
	"strconv"

	"github.com/google/uuid"
)

type DistrictRepositoryInterface interface {
	GetAllByRegion(ctx context.Context, orm orm.ORM, region int) ([]district.District, error)
	GetByID(ctx context.Context, orm orm.ORM, id uuid.UUID) (district.District, error)
}

type DistrictService struct {
	log        *slog.Logger
	orm        orm.ORM
	repository DistrictRepositoryInterface
}

func New(log *slog.Logger, orm orm.ORM, repository DistrictRepositoryInterface) *DistrictService {
	return &DistrictService{
		log:        log,
		orm:        orm,
		repository: repository,
	}
}

func (s *DistrictService) GetAllByRegion(ctx context.Context, region string) ([]district_dto.DistrictDTOResponse, error) {
	const op = "service.DistrictService.GetAllByRegion"

	log := s.log.With(slog.String("op", op))

	regionINT, err := strconv.Atoi(region)
	if err != nil {
		log.Error("failed parse region to int", slog.String("region", region), liblogger.Err(err))
		return nil, errs.ErrBadRequest
	}

	districtsModel, err := s.repository.GetAllByRegion(ctx, s.orm, regionINT)
	if err != nil {
		log.Error("failed get all regions by region", liblogger.Err(err))
		return nil, errs.ErrBadRequest
	}

	return district_mapper.ManyToDTO(districtsModel), nil
}

func (s *DistrictService) GetByID(ctx context.Context, id string) (district_dto.DistrictDTOResponse, error) {
	const op = "service.DistrictService.GetByID"

	log := s.log.With(slog.String("op", op))

	uid, err := uuid.Parse(id)
	if err != nil {
		log.Error("failed parse id to uuid", slog.String("id", id), liblogger.Err(err))
		return district_dto.DistrictDTOResponse{}, errs.ErrBadRequest
	}

	districtModel, err := s.repository.GetByID(ctx, s.orm, uid)
	if err != nil {
		log.Error("failed get district by id", liblogger.Err(err))
		return district_dto.DistrictDTOResponse{}, errs.ErrInternalError
	}

	return district_mapper.ToDTO(districtModel), nil
}
