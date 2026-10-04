package homework_task

import (
	"main/internal/models/homework"
	"main/internal/models/task"

	"github.com/google/uuid"
)

type HomeworkTask struct {
	HomeworkID uuid.UUID         `gorm:"type:uuid;not null;"`
	Homework   homework.Homework `gorm:"foreignKey:HomeworkID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	TaskID     uuid.UUID         `gorm:"type:uuid;not null;"`
	Task       task.Task         `gorm:"foreignKey:TaskID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
