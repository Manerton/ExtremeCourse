package app

import (
	"context"
	"fmt"
	"log/slog"
	"main/internal/config"
	"main/internal/handlers/auth_handler"
	"main/internal/handlers/district_handler"
	"main/internal/handlers/link_handler"
	"main/internal/handlers/participant_handler"
	"main/internal/handlers/school_handler"
	"main/internal/handlers/user_handler"
	"main/internal/lib/helpers/notification_client"
	"main/internal/lib/jwttoken"
	"main/internal/lib/liblogger"
	"main/internal/middleware/base_access"
	"main/internal/middleware/midlogger"
	"main/internal/rabbitmq/consumer"
	"main/internal/repositories/district_repository"
	"main/internal/repositories/participant_repository"
	"main/internal/repositories/refresh_repository"
	"main/internal/repositories/school_repository"
	"main/internal/repositories/user_repository"
	"main/internal/services/auth_service"
	"main/internal/services/district_service"
	"main/internal/services/links_service"
	"main/internal/services/participant_service"
	"main/internal/services/school_service"
	"main/internal/services/user_service"
	"main/internal/storage/orm"
	"main/internal/storage/postgresql"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"
)

type App struct {
	server *http.Server
	log    *slog.Logger
}

func New(log *slog.Logger, cfg *config.Config) *App {

	// init storage
	storage := postgresql.MustPosgreSQL(cfg.GetDataSourceName())
	log.Info("storage are enabled")

	// init orm
	gormORM := orm.NewGormORM(storage)
	// init jwtManager
	jwtManager := jwttoken.NewJWTManager([]byte(cfg.Key), time.Duration(cfg.AccessDuration)*time.Minute, time.Duration(cfg.RefreshDuration)*time.Hour*24)
	// init repositories
	userRepository := &user_repository.UserRepository{}
	participantRepository := &participant_repository.ParticipantRepository{}
	schoolRepository := &school_repository.SchoolRepository{}
	refreshRepository := &refresh_repository.RefreshRepository{}
	districtRepository := &district_repository.DistrictRepository{}

	// init notify client
	notifyClient := notification_client.New(cfg.NotificationService)

	// init services
	authService := auth_service.New(log, gormORM, jwtManager, userRepository, participantRepository, refreshRepository, notifyClient)
	userService := user_service.New(log, gormORM, userRepository, participantRepository)
	schoolService := school_service.New(log, gormORM, schoolRepository)
	participantService := participant_service.New(log, gormORM, participantRepository)
	districtService := district_service.New(log, gormORM, districtRepository)
	linkService := links_service.New(log, gormORM, cfg.Prefix, jwtManager, schoolRepository, districtRepository)

	// init handlers
	userHandler := user_handler.New(userService)
	authHandler := auth_handler.New(authService)
	participantHandler := participant_handler.New(participantService)
	schoolHandler := school_handler.New(schoolService)
	districtHandler := district_handler.New(districtService)
	linkHandler := link_handler.New(linkService)

	// init rabbitMQ
	rabbitConsumer := consumer.New(log, cfg.AddressRabbitPath, userService, participantService, authService, schoolService)
	rabbitConsumer.Start(context.Background(), cfg.QueueName)
	log.Info("rabbit started")

	// init router
	router := chi.NewRouter()

	app := &App{log: log}
	// init cors
	app.initCors(router, cfg.AdditionalAddressesConfig)
	// init middleware
	router.Use(midlogger.NewMidLogger(log))
	router.Use(middleware.URLFormat)

	// init routes
	app.initRoutes(router, jwtManager,
		authHandler,
		userHandler,
		schoolHandler,
		participantHandler,
		districtHandler,
		linkHandler)

	// init server
	app.server = &http.Server{
		Addr:    cfg.GetAddress(),
		Handler: router,
	}

	return app
}

func (a *App) initRoutes(router *chi.Mux,
	jwtManager *jwttoken.JWTManager,
	authHandler *auth_handler.AuthHandler,
	userHandler *user_handler.UserHandler,
	schoolHandler *school_handler.SchoolHandler,
	participantHandler *participant_handler.ParticipantHandler,
	districtHandler *district_handler.DistrictHandler,
	linkHandler *link_handler.LinkHandler) {

	router.Get("/swagger/*", httpSwagger.WrapHandler)

	router.Post("/api/byadmin/register", authHandler.AdminRegister)
	router.Post("/api/users/login", authHandler.Login)
	router.Post("/api/users/logout", authHandler.Logout)
	router.Post("/api/users/forgot-password", authHandler.RecoveryPassword)
	router.Post("/api/users/register", authHandler.Register)
	router.Post("/api/users/refresh", authHandler.Refresh)

	router.Post("/api/users/verify", authHandler.VerifyTrustCode)

	router.Post("/api/auth/check-phone", authHandler.CheckPhone)
	router.Post("/api/auth/check-email", authHandler.CheckEmail)

	router.Get("/api/districts/{region}", districtHandler.GetAllByRegion)
	router.Get("/api/schools/district/{id}", schoolHandler.GetAllByDistrict)
	router.Get("/api/schools/all", schoolHandler.GetAll)

	router.With(base_access.BaseAccess(jwtManager)).Group(func(r chi.Router) {
		// link GET
		r.Get("/api/links-access/{region}", linkHandler.GetLinks)

		// participant GET
		r.Get("/api/participants", participantHandler.GetAllParticipants)
		r.Get("/api/participants/count", participantHandler.GetCount)
		r.Get("/api/participants/{id}", participantHandler.GetById)
		r.Get("/api/participants/byuser/{id}", participantHandler.GetByUserId)

		// users GET
		r.Get("/api/users", userHandler.GetAll)
		r.Get("/api/users/count", userHandler.GetCountUsers)
		r.Post("/api/users/filter", userHandler.GetUserByFilter)
		r.Post("/api/users/list", userHandler.GetUsersByListId)
		r.Get("/api/users/{id}", userHandler.GetUserById)
		r.Get("/api/users/all-info/{id}", userHandler.GetUserParticipantById)
		r.Get("/api/users/participants/all-info", userHandler.GetAllUserParticipantInfo)
		r.Post("/api/users/all-info-list", userHandler.GetUserParticipantByListId)

		r.Get("/api/users/by-role", userHandler.GetUsersByRole)

		// schools GET
		r.Get("/api/schools/count", schoolHandler.GetCount)
		r.Get("/api/schools/{id}", schoolHandler.GetById)

		// schools POST
		r.Post("/api/schools/create", schoolHandler.Create)

		// users POST
		r.Post("/api/users/change-password/{id}", userHandler.ChangePassword)
		r.Post("/api/users/revoke/{id}", authHandler.RevokeToken)
		r.Post("/api/users/revoke-all/{id}", authHandler.RevokeAllUserTokens)

		r.Put("/api/users/{id}", userHandler.Update)
		r.Put("/api/participants/{id}", participantHandler.Update)
		r.Put("/api/schools/{id}", schoolHandler.Update)

		// r.Put("/schools/{id}", sch)

		r.Delete("/api/users/{id}", userHandler.Delete)
	})
}

func (a *App) initCors(router *chi.Mux, cfg config.AdditionalAddressesConfig) {
	corsOptions := cors.Options{
		AllowedOrigins: []string{cfg.ReactVision, cfg.JureAssignmentsService},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"X-Requested-With",
		},
		ExposedHeaders: []string{
			"Link",
			"Content-Length",
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Credentials",
		},
		AllowCredentials: true,
		MaxAge:           300,
	}
	router.Use(cors.Handler(corsOptions))
}

func (a *App) MustRun() {
	if err := a.Run(); err != nil {
		panic(err)
	}
}

func (a *App) Run() error {
	const op = "app.Run"

	a.log.Info("server starting")
	if err := a.server.ListenAndServe(); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (a *App) Stop() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := a.server.Shutdown(ctx); err != nil {
		a.log.Error("failed to stop server", liblogger.Err(err))
		return
	}
	a.log.Info("server stopped")
}
