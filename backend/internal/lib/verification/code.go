package verification

import (
	"fmt"
	"math/rand/v2"
	"time"
)

func GenerateCode() string {
	return fmt.Sprintf("%04d", rand.IntN(10000))
}

// Дедлайн регистрации: до 23:59:59 12.10.2026 UTC
// (при необходимости замените time.UTC на time.Local или нужную таймзону)
var RegistrationDeadline = time.Date(2026, time.October, 12, 23, 59, 59, 999999999, time.UTC)
