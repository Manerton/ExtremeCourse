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

type UserDetailsDTO struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	FullName    string    `json:"full_name"`
	PhoneNumber string    `json:"phone_number"`
	BirthDate   time.Time `json:"birth_date"`
}

type SchoolDetailsDTO struct {
	ID           string `json:"id"`
	FullName     string `json:"full_name"`
	Name         string `json:"name"`
	DistrictID   string `json:"district_id"`
	DistrictName string `json:"district_name,omitempty"`
}

type EventDetailsDTO struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Subject string `json:"subject"`
	Class   int    `json:"class"`
	Status  int    `json:"status"`
}

type FullApplicationDetailsDTO struct {
	ID                 string           `json:"id"`
	Status             int              `json:"status"`
	ClassParticipation int              `json:"class_participation"`
	SubmittedAt        time.Time        `json:"submitted_at"`
	UpdatedAt          time.Time        `json:"updated_at"`
	User               UserDetailsDTO   `json:"user"`
	School             SchoolDetailsDTO `json:"school"`
	Event              EventDetailsDTO  `json:"event"`
}
