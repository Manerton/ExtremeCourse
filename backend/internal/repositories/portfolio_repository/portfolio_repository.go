package portfolio_repository

import (
	"context"
	"fmt"

	models "main/internal/models/portfolio"
	"main/internal/storage/orm"

	"github.com/google/uuid"
)

type PortfolioRepository struct{}

func New() *PortfolioRepository {
	return &PortfolioRepository{}
}

func (r *PortfolioRepository) Create(ctx context.Context, o orm.ORM, p *models.Portfolio) (uuid.UUID, error) {
	const op = "repositories.PortfolioRepository.Create"
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	if err := o.Create(ctx, p); err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", op, err)
	}
	return p.ID, nil
}

func (r *PortfolioRepository) GetByApplicationID(ctx context.Context, o orm.ORM, appID uuid.UUID) (models.Portfolio, error) {
	const op = "repositories.PortfolioRepository.GetByApplicationID"
	var p models.Portfolio
	err := o.First(ctx, models.Portfolio{}, nil, &p, models.Portfolio{ApplicationID: appID})
	if err != nil {
		return models.Portfolio{}, fmt.Errorf("%s: %w", op, err)
	}
	return p, nil
}

func (r *PortfolioRepository) GetByApplicationIDList(ctx context.Context, o orm.ORM, appIDs []uuid.UUID) ([]models.Portfolio, error) {
	const op = "repositories.PortfolioRepository.GetByApplicationIDList"
	var result []models.Portfolio
	if err := o.Find(ctx, models.Portfolio{}, nil, nil, nil, nil, nil, &result, "application_id IN ?", appIDs); err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return result, nil
}

func (r *PortfolioRepository) Update(ctx context.Context, o orm.ORM, p *models.Portfolio) error {
	const op = "repositories.PortfolioRepository.Update"
	err := o.Updates(ctx, models.Portfolio{ID: p.ID}, p)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
