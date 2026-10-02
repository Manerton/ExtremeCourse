package district_mapper

import (
	district_dto "main/internal/dto/district"
	"main/internal/models/district"
)

func ToDTO(model district.District) district_dto.DistrictDTOResponse {
	return district_dto.DistrictDTOResponse{
		ID:     model.ID.String(),
		Name:   model.Name,
		Region: int(model.Region),
	}
}

func ManyToDTO(models []district.District) []district_dto.DistrictDTOResponse {
	result := make([]district_dto.DistrictDTOResponse, 0, len(models))
	for _, model := range models {
		result = append(result, ToDTO(model))
	}
	return result
}
