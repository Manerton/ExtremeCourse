package models

import (
	"time"

	"github.com/google/uuid"
)

const (
	ApprovedStatus             = 2
	RejectedStatus             = 3
	InvitedStatus              = 1
	RejectedOrganizationStatus = 4
)

type Application struct {
	ID                 uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID             uuid.UUID `gorm:"not null"`
	SchoolID           uuid.UUID `gorm:"not null"`
	EventID            uuid.UUID `gorm:"not null"`
	ClassParticipation int       `gorm:"type:int"`
	Status             int       `gorm:"default:1"` // 2 = одобрено, 3 = Отменено, 1 = приглашён
	SubmittedAt        time.Time `gorm:"autoCreateTime"`
	UpdatedAt          time.Time `gorm:"autoUpdateTime"`
}
