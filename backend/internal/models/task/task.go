package task

import "github.com/google/uuid"

type Task struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name        string
	Description string
	MaxPoints   int
}
