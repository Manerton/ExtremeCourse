package district

import (
	"main/internal/dictionary/region_dictionary"

	"github.com/google/uuid"
)

type District struct {
	ID     uuid.UUID                  `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name   string                     `gorm:"type:varchar(255);not null;uniqueIndex"`
	Region region_dictionary.RegionID `gorm:"foreignKey:RegionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
