package homework_dto

import "time"

type CreateHomeworkRequestDTO struct {
	Name       string    `json:"name"`
	PublishAt  time.Time `json:"publish_at"`
	DeadlineAt time.Time `json:"deadline_at"`
}

type CreateTaskRequestDTO struct {
	Name        string              `json:"name"`
	Description string              `json:"description"`
	MaxPoints   int                 `json:"max_points"`
	Answers     []TaskAnswerItemDTO `json:"answers"`
}

type TaskAnswerItemDTO struct {
	Answer  string `json:"answer"`
	Correct bool   `json:"correct"`
}

type AddTaskToHomeworkDTO struct {
	TaskID string `json:"task_id"`
}

type SubmitAnswerItemDTO struct {
	TaskID string `json:"task_id"`
	Answer string `json:"answer"`
}

type SubmitHomeworkRequestDTO struct {
	Answers []SubmitAnswerItemDTO `json:"answers"`
}

type HomeworkResponseDTO struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Status     int       `json:"status"`
	PublishAt  time.Time `json:"publish_at"`
	DeadlineAt time.Time `json:"deadline_at"`
}

type TaskResultResponseDTO struct {
	TaskID        string `json:"task_id"`
	UserAnswer    string `json:"user_answer"`
	IsCorrect     bool   `json:"is_correct"`
	PointsAwarded int    `json:"points_awarded"`
}

type SubmissionResponseDTO struct {
	ID          string                  `json:"id"`
	HomeworkID  string                  `json:"homework_id"`
	UserID      string                  `json:"user_id"`
	TotalScore  int                     `json:"total_score"`
	SubmittedAt time.Time               `json:"submitted_at"`
	Results     []TaskResultResponseDTO `json:"results,omitempty"`
}

type StudentHomeworkLeaderboardDTO struct {
	UserID     string `json:"user_id"`
	UserFIO    string `json:"user_fio"`
	TotalScore int    `json:"total_score"`
}

type EventLeaderboardItemDTO struct {
	Rank       int    `json:"rank"`
	UserID     string `json:"user_id"`
	UserFIO    string `json:"user_fio"`
	TotalScore int    `json:"total_score"`
}
