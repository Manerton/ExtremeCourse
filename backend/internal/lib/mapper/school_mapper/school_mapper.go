package school_mapper

import (
	school_dto "main/internal/dto/school"
	"main/internal/models/school"

	"github.com/google/uuid"
)

func FromModelToDTO(school school.School) school_dto.SchoolResponseDTO {
	return school_dto.SchoolResponseDTO{
		ID:         school.ID.String(),
		Name:       school.Name,
		FullName:   school.FullName,
		DistrictID: school.DistrictID.String(),
	}
}

func FromManyModelToDTO(schools []school.School) []school_dto.SchoolResponseDTO {
	schoolDTO := make([]school_dto.SchoolResponseDTO, 0, len(schools))
	for _, schoolRes := range schools {
		schoolDTO = append(schoolDTO, FromModelToDTO(schoolRes))
	}
	return schoolDTO
}

func FromCreateDTOToModel(schoolDto school_dto.CreateSchoolRequestDTO) (school.School, error) {

	districtID, err := uuid.Parse(schoolDto.DistrictID)
	if err != nil {
		return school.School{}, nil
	}

	return school.School{
		Name:       schoolDto.Name,
		FullName:   schoolDto.FullName,
		DistrictID: districtID,
	}, nil
}

func FromUpdateDTOToModel(schoolDto school_dto.UpdateSchoolRequestDTO, uid uuid.UUID) (school.School, error) {
	districtID, err := uuid.Parse(*schoolDto.DistrictID)
	if err != nil {
		return school.School{}, nil
	}

	return school.School{
		ID:         uid,
		Name:       *schoolDto.Name,
		FullName:   *schoolDto.FullName,
		DistrictID: districtID,
	}, nil
}
