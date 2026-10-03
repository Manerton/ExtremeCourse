package participant_mapper

import (
	"fmt"
	register_dto "main/internal/dto/auth/register"
	participant_dto "main/internal/dto/participant"
	user_dto "main/internal/dto/user"
	"main/internal/models/participant"
	"strconv"

	"github.com/google/uuid"
)

func ToDTO(participantModel participant.Participant) participant_dto.ParticipantResponseDTO {

	return participant_dto.ParticipantResponseDTO{
		ParticipantId: participantModel.ID.String(),
		UserId:        participantModel.UserId.String(),
		Disability:    participantModel.Disability,
		SchoolId:      participantModel.SchoolId.String(),

		Citizenship: participantModel.Citizenship,
		ClassNumber: participantModel.ClassNumber,
	}
}

func FromRegisterToModel(registerDTO *register_dto.RegisterParticipantRequestDTO, userId uuid.UUID) participant.Participant {
	schoolId, err := uuid.Parse(registerDTO.SchoolId)
	if err != nil {

	}

	disability, err := strconv.Atoi(registerDTO.Disability)
	citizenship, err := strconv.Atoi(registerDTO.Citizenship)
	classNumber, err := strconv.Atoi(registerDTO.ClassNumber)

	return participant.Participant{
		UserId:      userId,
		Disability:  disability,
		SchoolId:    schoolId,
		Citizenship: citizenship,
		ClassNumber: classNumber,
	}
}

func FromUpdateToModel(updateDTO participant_dto.UpdateParticipantRequestDTO, uid uuid.UUID) (participant.Participant, error) {
	var model participant.Participant
	model.ID = uid

	if updateDTO.Disability != nil {
		val, err := strconv.Atoi(*updateDTO.Disability)
		if err != nil {
			return model, fmt.Errorf("invalid disability value: %w", err)
		}
		model.Disability = val
	}

	if updateDTO.Citizenship != nil {
		val, err := strconv.Atoi(*updateDTO.Citizenship)
		if err != nil {
			return model, fmt.Errorf("invalid citizenship value: %w", err)
		}
		model.Citizenship = val
	}

	if updateDTO.ClassNumber != nil {
		model.ClassNumber = *updateDTO.ClassNumber
	}

	if updateDTO.SchoolId != nil {
		sid, err := uuid.Parse(*updateDTO.SchoolId)
		if err != nil {
			return model, fmt.Errorf("invalid school_id value: %w", err)
		}
		model.SchoolId = sid
	}

	return model, nil
}

func FromPreloadToUserParticipantModel(participantModel participant.Participant) user_dto.UserParticipantResponseDTO {
	return user_dto.UserParticipantResponseDTO{
		UserResponseDTO: user_dto.UserResponseDTO{
			ID:          participantModel.User.ID.String(),
			Email:       participantModel.User.Email,
			FirstName:   participantModel.User.Firstname,
			Surname:     participantModel.User.Surname,
			Patronymic:  participantModel.User.Patronymic,
			PhoneNumber: participantModel.User.PhoneNumber,
			BirthDate:   participantModel.User.BirthDate.String(),
			Gender:      int(participantModel.User.Gender),
			Role:        int(participantModel.User.Role),
			Activated:   participantModel.User.Activated,
		},
		ParticipantResponseDTO: participant_dto.ParticipantResponseDTO{
			ParticipantId: participantModel.ID.String(),
			UserId:        participantModel.UserId.String(),
			Disability:    participantModel.Disability,
			SchoolId:      participantModel.SchoolId.String(),
			Citizenship:   participantModel.Citizenship,
			ClassNumber:   participantModel.ClassNumber,
		},
	}
}

func FromPreloadToUserParticipantModelList(participantModels []participant.Participant) []user_dto.UserParticipantResponseDTO {
	result := make([]user_dto.UserParticipantResponseDTO, 0, len(participantModels))
	for _, participantModel := range participantModels {
		result = append(result, FromPreloadToUserParticipantModel(participantModel))
	}
	return result
}
