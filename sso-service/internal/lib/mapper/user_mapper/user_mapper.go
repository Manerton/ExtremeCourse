package user_mapper

import (
	register_dto "main/internal/dto/auth/register"
	user_dto "main/internal/dto/user"
	"main/internal/models/user"
	"strconv"
	"time"

	"github.com/google/uuid"
)

func ToDTO(user user.User) user_dto.UserResponseDTO {
	return user_dto.UserResponseDTO{
		ID:          user.ID.String(),
		Email:       user.Email,
		FirstName:   user.Firstname,
		Surname:     user.Surname,
		Patronymic:  user.Patronymic,
		Gender:      int(user.Gender),
		Role:        int(user.Role),
		PhoneNumber: user.PhoneNumber,
		BirthDate:   user.BirthDate.String(),
		Activated:   user.Activated,
	}
}

func ToDTOs(users []user.User) []user_dto.UserResponseDTO {
	usersResults := make([]user_dto.UserResponseDTO, 0, len(users))
	for _, user := range users {
		usersResults = append(usersResults, ToDTO(user))
	}

	return usersResults
}

func FromRegisterToModel(regiterDTO *register_dto.RegisterParticipantRequestDTO) user.User {
	birhDate, _ := time.Parse("2006-01-02", regiterDTO.BirthDate)

	gender, err := strconv.Atoi(regiterDTO.Gender)
	if err != nil {

	}

	return user.User{
		Email:       regiterDTO.Email,
		Firstname:   regiterDTO.FirstName,
		Surname:     regiterDTO.Surname,
		Patronymic:  regiterDTO.Patronymic,
		PhoneNumber: regiterDTO.PhoneNumber,
		BirthDate:   birhDate,
		Gender:      user.GenderType(gender),
		Role:        user.PARTICIPANT,
		Activated:   false,
	}
}

func FromRegisterUserToModel(regiterDTO *register_dto.RegisterUserRequestDTO) user.User {
	birthDate, _ := time.Parse("2006-01-02", regiterDTO.BirthDate)

	gender, err := strconv.Atoi(regiterDTO.Gender)
	if err != nil {
	}

	role, err := strconv.Atoi(regiterDTO.Role)
	if err != nil {
	}

	print(regiterDTO.PhoneNumber)

	return user.User{
		Email:       regiterDTO.Email,
		Firstname:   regiterDTO.FirstName,
		Surname:     regiterDTO.Surname,
		Patronymic:  regiterDTO.Patronymic,
		PhoneNumber: regiterDTO.PhoneNumber,
		Gender:      user.GenderType(gender),
		Role:        user.RoleType(role),
		BirthDate:   birthDate,
		Activated:   true,
	}
}

func FromUpdateToModel(updateDTO user_dto.UpdateUserRequestDTO, uid uuid.UUID) user.User {
	gender := 0
	if updateDTO.Gender != nil {
		gender, _ = strconv.Atoi(*updateDTO.Gender)

	}

	email := ""
	if updateDTO.Email != nil {
		email = *updateDTO.Email
	}

	phoneNumber := ""
	if updateDTO.PhoneNumber != nil {
		phoneNumber = *updateDTO.PhoneNumber
	}

	return user.User{
		ID:          uid,
		Email:       email,
		Firstname:   *updateDTO.Firstname,
		Surname:     *updateDTO.Surname,
		Patronymic:  *updateDTO.Patronymic,
		PhoneNumber: phoneNumber,
		Gender:      user.GenderType(gender),
	}
}

func FromSearchToModel(search user_dto.SearchAttributesUserDTO) user.User {
	id := uuid.Nil
	if search.ID != nil {
		id, _ = uuid.Parse(*search.ID)
	}
	birthDate := time.Time{}
	if search.BirthDate != nil {
		birthDate, _ = time.Parse("2006-01-02", *search.BirthDate)
	}

	return user.User{
		ID:          id,
		Email:       *search.Email,
		Firstname:   *search.Firstname,
		Surname:     *search.Surname,
		Patronymic:  *search.Patronymic,
		PhoneNumber: *search.PhoneNumber,
		Gender:      user.GenderType(*search.Gender),
		Role:        user.RoleType(*search.Role),
		Activated:   *search.Activated,
		BirthDate:   birthDate,
	}
}
