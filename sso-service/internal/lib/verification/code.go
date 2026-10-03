package verification

import (
	"fmt"
	"math/rand/v2"
)

func GenerateCode() string {
	return fmt.Sprintf("%04d", rand.IntN(10000))
}