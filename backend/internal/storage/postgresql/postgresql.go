package postgresql

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func MustPosgreSQL(connectStr string) *gorm.DB {

	const op = "storage.postgresql.MustPosgreSQL"

	// try to connect posgresql
	db, err := gorm.Open(postgres.Open(connectStr), &gorm.Config{})
	if err != nil {
		log.Fatalf("%s: %v", op, err)
	}

	return db
}
