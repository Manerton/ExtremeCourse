package main

import (
	"log/slog"
	"main/internal/app"
	"main/internal/config"
	"main/internal/lib/liblogger"
	redisdb "main/internal/storage/redis"
	"os"
	"os/signal"
	"syscall"

	_ "main/docs"
)

const configPath = "config-yaml/dev.yaml"
const localPath = "config-yaml/local.yaml"

const AbsolutePath = "C:/Users/Admin/goProject/OlympiadProject/sso-service/config-yaml/dev.yaml"

// @title SSO Service API
// @version 1.0
// @description Документация к микросервису авторизации
// @host localhost:8181
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {

	cfg := config.MustConfig(AbsolutePath)

	log := liblogger.SetupLogger(cfg.Env)
	log.Info("start sso-service", slog.String("env", cfg.Env))
	log.Debug("debug message are enable")

	// init redis
	redisdb.InitRedis(cfg.AddressRedisPath)
	// init app
	app := app.New(log, cfg)

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	// start app
	go app.MustRun()
	log.Info("server started")
	<-done
	// stop app
	app.Stop()
	log.Info("server stopped")
}
