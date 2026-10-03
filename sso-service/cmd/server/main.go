package main

import (
	"context"
	"log/slog"
	"main/internal/app"
	"main/internal/config"
	"main/internal/lib/liblogger"
	"os"
	"os/signal"
	"syscall"

	_ "main/docs"
)

// @title Backend
// @version 1.0
// @description Документация к backend части сайта
// @BasePath /backend
// @securityDefinitions.apikey BearerAuth
// @in   header
// @name Authorization
func main() {
	cfg := config.MustConfigLoad()

	log := liblogger.SetupLogger(cfg.Env)
	log.Info("startint backend server", slog.String("env", cfg.Env))
	log.Debug("debug message are enable")

	app := app.New(log, cfg)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	log.Info("server starting...")
	if err := app.Run(ctx); err != nil {
		log.Error("application terminated with error", liblogger.Err(err))
	}

	log.Info("server stopped")
}
