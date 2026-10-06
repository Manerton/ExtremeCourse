package portfolio

import (
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Portfolio struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	ApplicationID   uuid.UUID      `gorm:"type:uuid;uniqueIndex;not null" json:"application_id"`
	Description     string         `gorm:"type:text;not null;default:''" json:"description"`
	Score           int            `gorm:"not null;default:0" json:"score"`
	CodeAchievement pq.StringArray `gorm:"type:text[]" json:"code_achievement"` // <- используем pq.StringArray
	FilePath        string         `gorm:"type:text;not null;default:''" json:"file_path"`
}

// Указываем имя таблицы явно, чтобы не возникало предупреждения "Table not set"
func (Portfolio) TableName() string {
	return "portfolio"
}
