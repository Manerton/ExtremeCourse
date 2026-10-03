package school_dto

type CreateSchoolRequestDTO struct {
	Name       string `json:"name"`
	FullName   string `json:"full_name"`
	DistrictID string `json:"district_id"`
}

type UpdateSchoolRequestDTO struct {
	Name       *string `json:"name"`
	FullName   *string `json:"full_name"`
	DistrictID *string `json:"district_id"`
}

type SchoolResponseDTO struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	FullName   string `json:"full_name"`
	DistrictID string `json:"district_id"`
}
