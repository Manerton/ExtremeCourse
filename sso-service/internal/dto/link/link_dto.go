package link_dto

const (
	DistricType = 0
	SchoolType  = 1
)

type LinkDTO struct {
	Type int    `json:"type"`
	Name string `json:"name"`
	Link string `json:"link"`
}
