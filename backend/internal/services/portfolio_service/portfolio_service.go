package portfolio_service

import (
	"context"
	"io"
	"log/slog"

	"main/internal/dictionary/achievement_dictionary"
	dto "main/internal/dto/portfolio"
	"main/internal/lib/errs"
	"main/internal/lib/liblogger"
	models "main/internal/models/portfolio"
	"main/internal/storage/orm"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type PortfolioRepository interface {
	Create(ctx context.Context, o orm.ORM, p *models.Portfolio) (uuid.UUID, error)
	GetByApplicationID(ctx context.Context, o orm.ORM, appID uuid.UUID) (models.Portfolio, error)
	Update(ctx context.Context, o orm.ORM, p *models.Portfolio) error
}

type FileStorage interface {
	Save(filename string, src io.Reader) (string, error)
	Delete(filePath string) error
}

type PortfolioService struct {
	db          orm.ORM
	log         *slog.Logger
	repo        PortfolioRepository
	fileStorage FileStorage
}

func New(log *slog.Logger, db orm.ORM, repo PortfolioRepository, fileStorage FileStorage) *PortfolioService {
	return &PortfolioService{
		db:          db,
		log:         log.With(slog.String("owner", "PortfolioService")),
		repo:        repo,
		fileStorage: fileStorage,
	}
}

// CalculateTotalScore суммирует баллы на основе справочника
func (s *PortfolioService) calculateScore(codes []string) int {
	total := 0
	for _, code := range codes {
		if score, ok := achievement_dictionary.GetScore(achievement_dictionary.AchievementType(code)); ok {
			total += score
		}
	}
	return total
}

func (s *PortfolioService) CreatePortfolio(
	ctx context.Context,
	appID uuid.UUID,
	desc string,
	codes []string,
	filename string,
	fileReader io.Reader,
) (uuid.UUID, error) {
	const op = "services.PortfolioService.CreatePortfolio"
	log := s.log.With(slog.String("op", op))

	var savedPath string
	if fileReader != nil && filename != "" {
		path, err := s.fileStorage.Save(filename, fileReader)
		if err != nil {
			log.Error("failed to save portfolio file", liblogger.Err(err))
			return uuid.Nil, errs.ErrInternalError.Wrap("failed to save file")
		}
		savedPath = path
	}

	p := models.Portfolio{
		ApplicationID:   appID,
		Description:     desc,
		CodeAchievement: pq.StringArray(codes),
		Score:           s.calculateScore(codes),
		FilePath:        savedPath,
	}

	id, err := s.repo.Create(ctx, s.db, &p)
	if err != nil {
		if savedPath != "" {
			_ = s.fileStorage.Delete(savedPath)
		}
		log.Error("failed to create portfolio", liblogger.Err(err))
		return uuid.Nil, errs.ErrInternalError.Wrap("failed to create portfolio")
	}

	return id, nil
}

func (s *PortfolioService) GetByApplicationID(ctx context.Context, appIDStr string) (dto.PortfolioResponseDTO, error) {
	appID, err := uuid.Parse(appIDStr)
	if err != nil {
		return dto.PortfolioResponseDTO{}, errs.ErrBadRequest.Wrap("invalid application id")
	}

	p, err := s.repo.GetByApplicationID(ctx, s.db, appID)
	if err != nil {
		if s.db.IsNotFound(err) {
			return dto.PortfolioResponseDTO{}, errs.ErrBadRequest.Wrap("portfolio not found")
		}
		return dto.PortfolioResponseDTO{}, errs.ErrInternalError
	}

	return dto.PortfolioResponseDTO{
		ID:              p.ID.String(),
		ApplicationID:   p.ApplicationID.String(),
		Description:     p.Description,
		Score:           p.Score,
		CodeAchievement: p.CodeAchievement,
		FilePath:        p.FilePath,
	}, nil
}

func (s *PortfolioService) UpdatePortfolio(ctx context.Context, appIDStr string, update dto.UpdatePortfolioDTO) error {
	appID, err := uuid.Parse(appIDStr)
	if err != nil {
		return errs.ErrBadRequest.Wrap("invalid application id")
	}

	p, err := s.repo.GetByApplicationID(ctx, s.db, appID)
	if err != nil {
		return errs.ErrBadRequest.Wrap("portfolio not found")
	}

	if update.Description != nil {
		p.Description = *update.Description
	}
	if update.CodeAchievement != nil {
		p.CodeAchievement = update.CodeAchievement
		p.Score = s.calculateScore(update.CodeAchievement)
	}

	return s.repo.Update(ctx, s.db, &p)
}

func (s *PortfolioService) ReplaceFile(ctx context.Context, appIDStr string, filename string, r io.Reader) error {
	appID, err := uuid.Parse(appIDStr)
	if err != nil {
		return errs.ErrBadRequest.Wrap("invalid application id")
	}

	p, err := s.repo.GetByApplicationID(ctx, s.db, appID)
	if err != nil {
		return errs.ErrBadRequest.Wrap("portfolio not found")
	}

	newPath, err := s.fileStorage.Save(filename, r)
	if err != nil {
		return errs.ErrInternalError.Wrap("failed to save new file")
	}

	oldPath := p.FilePath
	p.FilePath = newPath

	if err := s.repo.Update(ctx, s.db, &p); err != nil {
		_ = s.fileStorage.Delete(newPath)
		return errs.ErrInternalError.Wrap("failed to update record")
	}

	_ = s.fileStorage.Delete(oldPath)
	return nil
}

func (s *PortfolioService) DeleteFile(ctx context.Context, appIDStr string) error {
	appID, err := uuid.Parse(appIDStr)
	if err != nil {
		return errs.ErrBadRequest.Wrap("invalid application id")
	}

	p, err := s.repo.GetByApplicationID(ctx, s.db, appID)
	if err != nil {
		return errs.ErrBadRequest.Wrap("portfolio not found")
	}

	if p.FilePath == "" {
		return nil
	}

	oldPath := p.FilePath
	p.FilePath = ""

	if err := s.repo.Update(ctx, s.db, &p); err != nil {
		return errs.ErrInternalError.Wrap("failed to remove file path")
	}

	_ = s.fileStorage.Delete(oldPath)
	return nil
}
