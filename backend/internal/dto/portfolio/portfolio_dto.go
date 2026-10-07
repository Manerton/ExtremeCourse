package portfolio_dto

import "io"

type PortfolioResponseDTO struct {
	ID              string   `json:"id"`
	ApplicationID   string   `json:"application_id"`
	Description     string   `json:"description"`
	Score           int      `json:"score"`
	CodeAchievement []string `json:"code_achievement"`
	FilePath        string   `json:"file_path"`
}

type UpdatePortfolioDTO struct {
	Description     *string  `json:"description,omitempty" example:"Новое описание проекта"`
	CodeAchievement []string `json:"code_achievement,omitempty" example:"[\"MAXWELL_WINNER\",\"EULER_PRIZE_WINNER\"]"`
	Filename        string
	FileReader      io.Reader
}
