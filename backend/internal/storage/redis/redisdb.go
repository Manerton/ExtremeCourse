package redisdb

import (
	"context"
	"log"
	"main/internal/config"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	RDB *redis.Client
	CTX = context.Background()
)

func MustRedisConnect(cfg config.RedisConfig) *redis.Client {
	RDB = RunRedisConnect(cfg)

	if err := RDB.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("Redis connection failed: %v", err)
	}

	log.Println("Redis connected")

	return RDB
}

func RunRedisConnect(cfg config.RedisConfig) *redis.Client {
	RDB = redis.NewClient(&redis.Options{
		Addr:     cfg.GetRedisAddress(),
		Username: cfg.Username,
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	return RDB
}

func GetActivationCode(email string) (string, error) {
	key := email
	return RDB.Get(CTX, key).Result()
}

func SetActivationCode(key string, code string, expiration time.Duration) error {
	return RDB.Set(CTX, key, code, expiration).Err()
}
