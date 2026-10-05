package event_dto

type CreateEventRequestDTO struct {
	Name    string `json:"name"`
	Subject string `json:"subject"`
	Class   int    `json:"class"`
}

type UpdateEventStatusRequestDTO struct {
	Status int `json:"status"` // 1 = Closed, 2 = Open
}

type EventResponseDTO struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Subject string `json:"subject"`
	Class   int    `json:"class"`
	Status  int    `json:"status"`
}

type ApplyEventRequestDTO struct {
	UserId string `json:"user_id"`
}

type ReviewApplicationRequestDTO struct {
	Status int `json:"status"` // 2 = ApprovedStatus, 3 = RejectedStatus
}

type ApplicationResponseDTO struct {
	ID                 string `json:"id"`
	UserID             string `json:"user_id"`
	SchoolID           string `json:"school_id"`
	EventID            string `json:"event_id"`
	ClassParticipation int    `json:"class_participation"`
	Status             int    `json:"status"`
}
