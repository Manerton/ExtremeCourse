package user

import (
	"time"

	"github.com/google/uuid"
)

type RoleType int
type GenderType int

const (
	ADMIN       = 1
	PARTICIPANT = 2
	JUDGE       = 3
	ORGANIZER   = 4
)

const (
	MALE   = 1
	FEMALE = 2
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email        string
	PasswordHash string
	Firstname    string
	Surname      string
	Patronymic   string
	PhoneNumber  string
	BirthDate    time.Time `gorm:"column:birthdate"`
	Gender       GenderType
	Role         RoleType
	Activated    bool `gorm:"default:false"`
	CreatedAt    time.Time
}
