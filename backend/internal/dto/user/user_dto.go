package user_dto

import (
	participant_dto "main/internal/dto/participant"
)

type UserParticipantResponseDTO struct {
	UserResponseDTO
	participant_dto.ParticipantResponseDTO
}

type UserResponseDTO struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	FirstName   string `json:"firstname"`
	Surname     string `json:"surname"`
	Patronymic  string `json:"patronymic"`
	PhoneNumber string `json:"phone_number"`
	BirthDate   string `json:"birthdate"`
	Gender      int    `json:"gender"`
	Role        int    `json:"role"`
	Activated   bool   `json:"activated"`
}

type SearchAttributesUserDTO struct {
	ID          *string `json:"id"`
	Email       *string `json:"email"`
	Firstname   *string `json:"firstname"`
	Surname     *string `json:"surname"`
	Patronymic  *string `json:"patronymic"`
	PhoneNumber *string `json:"phone_number"`
	BirthDate   *string `json:"birthdate"`
	Gender      *int    `json:"gender"`
	Role        *int    `json:"role"`
	Activated   *bool   `json:"activated"`
}

type UpdateUserRequestDTO struct {
	Email       *string `json:"email"`
	Firstname   *string `json:"firstname"`
	Surname     *string `json:"surname"`
	Patronymic  *string `json:"patronymic"`
	Password    *string `json:"password"`
	PhoneNumber *string `json:"phone_number"`
	BirthDate   *string `json:"birthdate"`
	Gender      *string `json:"gender"`
}

type UpdateUserParticipantInfoDTO struct {
	FirstName   *string `json:"firstname"`
	Surname     *string `json:"surname"`
	Patronymic  *string `json:"patronymic"`
	BirthDate   *string `json:"birthdate"`
	ClassNumber *int    `json:"class_number"`
}
