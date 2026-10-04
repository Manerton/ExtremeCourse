package submission

import (
	"time"

	"main/internal/models/homework"
	"main/internal/models/task"
	"main/internal/models/user"

	"github.com/google/uuid"
)

type HomeworkSubmission struct {
	ID          uuid.UUID         `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	HomeworkID  uuid.UUID         `gorm:"type:uuid;not null;index:idx_user_hw,unique"`
	Homework    homework.Homework `gorm:"foreignKey:HomeworkID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID      uuid.UUID         `gorm:"type:uuid;not null;index:idx_user_hw,unique"`
	User        user.User         `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	TotalScore  int               `gorm:"default:0"`
	SubmittedAt time.Time         `gorm:"autoCreateTime"`
}

type SubmissionTaskResult struct {
	ID            uuid.UUID          `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	SubmissionID  uuid.UUID          `gorm:"type:uuid;not null;index"`
	Submission    HomeworkSubmission `gorm:"foreignKey:SubmissionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	TaskID        uuid.UUID          `gorm:"type:uuid;not null;index"`
	Task          task.Task          `gorm:"foreignKey:TaskID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserAnswer    string
	IsCorrect     bool
	PointsAwarded int
}
