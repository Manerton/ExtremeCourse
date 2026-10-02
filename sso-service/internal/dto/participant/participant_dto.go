package participant_dto

type ParticipantResponseDTO struct {
	ParticipantId string `json:"participant_id"`
	UserId        string `json:"user_id"`
	Disability    int    `json:"disability"`
	SchoolId      string `json:"school_id"`
	Citizenship   int    `json:"citizenship"`
	ClassNumber   int    `json:"class_number"`
}

type UpdateParticipantRequestDTO struct {
	Disability  *string `json:"disability"`
	SchoolId    *string `json:"school_id"`
	Citizenship *string `json:"citizenship"`
	ClassNumber *int    `json:"class_number"`
}
