package homework

import (
	"time"

	"github.com/google/uuid"
)

const (
	HomeworkStatusPublished = 1
	HomeworkStatusClosed    = 2
)

type Homework struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	EventId    uuid.UUID
	Name       string
	Status     int
	PublishAt  time.Time
	DeadlineAt time.Time
}
