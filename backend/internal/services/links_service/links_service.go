package links_service

import (
	"context"
	"fmt"
	"log/slog"
	link_dto "main/internal/dto/link"
	"main/internal/lib/errs"
	"main/internal/lib/jwttoken"
	"main/internal/lib/liblogger"
	"main/internal/models/district"
	"main/internal/models/school"
	"main/internal/storage/orm"
	"strconv"

	"github.com/google/uuid"
)

type SchoolRepositoryInterface interface {
	GetAllByDistrict(ctx context.Context, orm orm.ORM, districtId uuid.UUID) ([]school.School, error)
}

type DistrictRepositoryInterface interface {
	GetAllByRegion(ctx context.Context, orm orm.ORM, region int) ([]district.District, error)
}

type LinksService struct {
	log *slog.Logger
	db  orm.ORM

	prefixLink string
	jwtManager *jwttoken.JWTManager

	schoolRepository   SchoolRepositoryInterface
	districtRepository DistrictRepositoryInterface
}

func New(log *slog.Logger, orm orm.ORM,
	prefixLink string, jwtManger *jwttoken.JWTManager,
	schoolRepository SchoolRepositoryInterface, districtRepository DistrictRepositoryInterface) *LinksService {
	return &LinksService{
		log: log,
		db:  orm,

		prefixLink: prefixLink,
		jwtManager: jwtManger,

		schoolRepository:   schoolRepository,
		districtRepository: districtRepository,
	}
}

func (s *LinksService) GetLinks(ctx context.Context, region string) ([]link_dto.LinkDTO, error) {
	const op = "services.LinksService.GetLinks"

	log := s.log.With(
		slog.String("op", op),
	)

	regionInt, err := strconv.Atoi(region)
	if err != nil {
		log.Error("invalid region parameter", slog.String("region", region), liblogger.Err(err))
		return nil, errs.ErrBadRequest.Wrap("invalid region parameter")
	}

	allDistricts, err := s.districtRepository.GetAllByRegion(ctx, s.db, regionInt)
	if err != nil {
		log.Error("failed get districts by region", slog.String("region", region), liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed get districts by region")
	}

	resultLinks := []link_dto.LinkDTO{}

	for _, district := range allDistricts {

		linkAccss, err := s.createLink(district.ID.String(), link_dto.DistricType)
		if err != nil {
			log.Error("faild create link with access token", liblogger.Err(err))
			return nil, errs.ErrInternalError.Wrap("failed crate access link")
		}

		resultLinks = append(resultLinks, link_dto.LinkDTO{
			Type: link_dto.DistricType,
			Name: district.Name,
			Link: linkAccss,
		})

		allSchools, err := s.schoolRepository.GetAllByDistrict(ctx, s.db, district.ID)
		if err != nil {
			log.Error("failed get all schools by district", slog.String("district_id", district.ID.String()))
			return nil, errs.ErrInternalError.Wrap("failed get all schools by district")
		}

		for _, school := range allSchools {
			linkAccss, err := s.createLink(school.ID.String(), link_dto.SchoolType)
			if err != nil {
				log.Error("faild create link with access token", liblogger.Err(err))
				return nil, errs.ErrInternalError.Wrap("failed crate access link")
			}

			resultLinks = append(resultLinks, link_dto.LinkDTO{
				Type: link_dto.SchoolType,
				Name: school.Name,
				Link: linkAccss,
			})
		}

	}

	return resultLinks, nil
}

func (s *LinksService) createLink(id string, objectType int) (string, error) {
	const op = "services.LinkService.createLink"
	accessToken, err := s.jwtManager.CreateLinkToken(id, objectType)
	if err != nil {
		return "", fmt.Errorf("%s: %w", op, err)
	}

	return fmt.Sprintf("%s%s", s.prefixLink, accessToken), nil
}
