package task_answer

import (
	"main/internal/models/task"

	"github.com/google/uuid"
)

type TaskAnswer struct {
	ID      uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	TaskId  uuid.UUID `gorm:"type:uuid;not null;index"`
	Task    task.Task `gorm:"foreignKey:TaskId;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Answer  string
	Correct bool
}
