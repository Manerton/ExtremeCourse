package redisdb

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	RDB *redis.Client
	CTX = context.Background()
)

func InitRedis(addressPath string) {
	RDB = redis.NewClient(&redis.Options{
		Addr:     addressPath,
		Password: "",
		DB:       0,
	})

	_, err := RDB.Ping(CTX).Result()
	if err != nil {
		log.Println("Redis connection failed: %w", err)
		return
	}
	log.Println("Redis connection success")
}

func GetActivationCode(email string) (string, error) {
	key := email
	return RDB.Get(CTX, key).Result()
}

func SetActivationCode(key string, code string, expiration time.Duration) error {
	return RDB.Set(CTX, key, code, expiration).Err()
}
