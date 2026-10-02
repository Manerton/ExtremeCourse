package ApplicationDto

import (
	"time"

	"github.com/google/uuid"
)

// DTO для создания заявки
type CreateApplicationDTO struct {
	UserID             string `json:"userId" binding:"required"`
	EventID            string `json:"eventId" binding:"required"`
	SchoolID           string `json:"schoolId" binding:"required"`
	Profile            string `json:"profile"`
	ClassParticipation int    `json:"class_participation"`
}

// DTO для обновления статуса заявки
type UpdateApplicationDTO struct {
	Status             int    `json:"status"`       // // 2 = одобрено, 3 = отклонено, 1 = не обработано
	Reason             int    `gorm:"default:null"` // 1 по результатам предудущего года, 2 по результатам текущего
	Code               string `gorm:"default:null"` // 09_11_25
	Profile            string `json:"profile"`
	ClassParticipation int    `json:"class_participation"`
}

type DeleteApplicationDTO struct {
	ID       uuid.UUID `json:"id"`
	UserID   uuid.UUID `json:"userId"`
	EventID  uuid.UUID `json:"eventId"`
	SchoolID uuid.UUID `json:"schoolId"`
}

// DTO для возврата заявки
type ApplicationResponseDTO struct {
	ID                 uuid.UUID `json:"id"`
	UserID             uuid.UUID `json:"userId"`
	SchoolID           uuid.UUID `json:"schoolId"`
	EventID            uuid.UUID `json:"eventId"`
	Profile            string    `json:"profile"`
	ClassParticipation int       `json:"class_participation"`
	Status             int       `json:"status"` // // 2 = одобрено, 3 = отклонено, 1 = не обработано
	Reason             int       `json:"reason"` //
	Code               string    `json:"code"`   // 09_11_25
	SubmittedAt        time.Time `json:"submittedAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}
