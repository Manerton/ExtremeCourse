package participant

import (
	"main/internal/models/school"
	"main/internal/models/user"

	"github.com/google/uuid"
)

const (
	DISABILITY_OK     = 1
	DISABILITY_NOT_OK = 2
)

type Participant struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserId      uuid.UUID
	User        user.User
	Disability  int
	SchoolId    uuid.UUID
	School      school.School
	Citizenship int
	ClassNumber int
}
