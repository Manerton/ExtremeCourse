package portfolio

import "github.com/google/uuid"

type Portfolio struct {
	ID              uuid.UUID `json:"id" db:"id"`
	ApplicationID   uuid.UUID `json:"application_id" db:"application_id"`
	Description     string    `json:"description" db:"description"`
	Score           int       `json:"score" db:"score"`
	CodeAchievement []string  `json:"code_achievement" db:"code_achievement"`
	FilePath        string    `json:"file_path" db:"file_path"`
}
