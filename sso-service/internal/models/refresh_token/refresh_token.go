package refresh_token

import (
	"main/internal/models/user"
	"time"

	"github.com/google/uuid"
)

const (
	Active = 1
	Revoke = 2
)

type RefreshToken struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID     uuid.UUID `gorm:"type:uuid;not null"`
	User       user.User `gorm:"foreignKey:UserID;references:ID"`
	Token      string
	DeviceId   uuid.UUID `gorm:"type:uuid"`
	DeviceName string
	Status     int
	ExpiresAt  time.Time
	CreatedAt  time.Time
}
