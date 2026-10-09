package app

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	zvonok_client "main/internal/clients/zvonok"
	"main/internal/config"
	"main/internal/handlers/application_handler"
	"main/internal/handlers/auth_handler"
	"main/internal/handlers/district_handler"
	"main/internal/handlers/event_handler"
	"main/internal/handlers/link_handler"
	"main/internal/handlers/participant_handler"
	"main/internal/handlers/portfolio_handler"
	"main/internal/handlers/school_handler"
	"main/internal/handlers/user_handler"
	"main/internal/lib/jwttoken"
	"main/internal/lib/liblogger"
	"main/internal/middleware/base_access"
	"main/internal/middleware/midlogger"
	"main/internal/repositories/application_repository"
	"main/internal/repositories/district_repository"
	"main/internal/repositories/event_repository"
	"main/internal/repositories/participant_repository"
	"main/internal/repositories/portfolio_repository"
	"main/internal/repositories/refresh_repository"
	"main/internal/repositories/school_repository"
	"main/internal/repositories/user_repository"
	"main/internal/services/application_service"
	"main/internal/services/auth_service"
	"main/internal/services/district_service"
	"main/internal/services/event_service"
	"main/internal/services/links_service"
	"main/internal/services/participant_service"
	"main/internal/services/portfolio_service"
	"main/internal/services/school_service"
	"main/internal/services/user_service"
	"main/internal/storage/filestore"
	"main/internal/storage/orm"
	"main/internal/storage/postgresql"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/pressly/goose/v3"
	httpSwagger "github.com/swaggo/http-swagger"
	"google.golang.org/grpc"
)

type App struct {
	server      *http.Server
	grpcServer  *grpc.Server
	grpcAddress string
	log         *slog.Logger
}

func New(log *slog.Logger, cfg *config.Config) *App {
	app := &App{log: log}
	// init storage
	storage := postgresql.MustPosgreSQL(cfg.GetDataSourceName())
	log.Info("storage are enabled")

	if cfg.AutoMigrate {
		migrationCtx, stopMigration := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)

		log.Info("running database migrations...")
		err := app.autoMigrate(migrationCtx, cfg.GetDataSourceName(), cfg.Driver, cfg.Scheme, cfg.MigrationPath)
		if err != nil {
			stopMigration()
			log.Info("migration stage failed", "error", err)
			os.Exit(1)
		}
		stopMigration()
		log.Info("migrations applied successfully")
	}

	diskStore := filestore.NewDiskStorage("upload")

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
	eventReposotory := &event_repository.EventRepository{}
	applicationRepository := &application_repository.ApplicationRepository{}
	portfolioRepository := &portfolio_repository.PortfolioRepository{}

	// init notify client
	zvonokClient := zvonok_client.NewZvonokClient(cfg.ZvonokConfig)

	// init services
	authService := auth_service.New(log, gormORM, jwtManager, userRepository, participantRepository, refreshRepository, zvonokClient)
	userService := user_service.New(log, gormORM, userRepository, participantRepository)
	schoolService := school_service.New(log, gormORM, schoolRepository)
	participantService := participant_service.New(log, gormORM, participantRepository)
	districtService := district_service.New(log, gormORM, districtRepository)
	linkService := links_service.New(log, gormORM, cfg.Prefix, jwtManager, schoolRepository, districtRepository)
	eventService := event_service.New(log, gormORM, eventReposotory, applicationRepository, participantRepository)
	applicationService := application_service.NewApplicationService(log, gormORM, applicationRepository, participantRepository, schoolRepository, eventReposotory, portfolioRepository)
	portfolioService := portfolio_service.New(log, gormORM, portfolioRepository, diskStore)

	// init handlers
	userHandler := user_handler.New(userService)
	authHandler := auth_handler.New(authService)
	participantHandler := participant_handler.New(participantService)
	schoolHandler := school_handler.New(schoolService)
	districtHandler := district_handler.New(districtService)
	linkHandler := link_handler.New(linkService)
	eventHandler := event_handler.New(eventService)
	applicationHandler := application_handler.NewApplicationHandler(applicationService, log)
	portfolioHandler := portfolio_handler.New(portfolioService)

	// init router
	router := chi.NewRouter()

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
		linkHandler,
		applicationHandler,
		eventHandler,
		portfolioHandler,
	)

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
	linkHandler *link_handler.LinkHandler,
	applicationHandler *application_handler.ApplicationHandler,
	eventHandler *event_handler.EventHandler,
	portfolioHandler *portfolio_handler.PortfolioHandler) {

	router.Get("/swagger/*", httpSwagger.WrapHandler)

	// Public routes
	router.Post("/api/byadmin/register", authHandler.AdminRegister)
	router.Post("/api/users/login", authHandler.Login)
	router.Post("/api/users/logout", authHandler.Logout)
	router.Post("/api/users/forgot-password", authHandler.RecoveryPassword)
	router.Post("/api/users/register", authHandler.Register)
	router.Post("/api/users/send-call-code", authHandler.SendCallCode)
	router.Post("/api/users/refresh", authHandler.Refresh)

	// Сверено со Swagger: @Router /api/users/verify-code [post]
	router.Post("/api/users/verify-code", authHandler.VerifyTrustCode)

	// Сверено со Swagger: @Router /api/users/check-phone и check-email [post]
	router.Post("/api/users/check-phone", authHandler.CheckPhone)
	router.Post("/api/users/check-email", authHandler.CheckEmail)

	router.Get("/api/districts/{region}", districtHandler.GetAllByRegion)
	router.Get("/api/schools/district/{id}", schoolHandler.GetAllByDistrict)

	// Сверено со Swagger: @Router /api/schools [get]
	router.Get("/api/schools", schoolHandler.GetAll)

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

		// Сверено со Swagger: @Router /api/users/all-info [get]
		r.Get("/api/users/all-info", userHandler.GetAllUserParticipantInfo)

		// Сверено со Swagger: @Router /api/users/participants-by-list [post]
		r.Post("/api/users/participants-by-list", userHandler.GetUserParticipantByListId)

		r.Get("/api/users/by-role", userHandler.GetUsersByRole)

		// schools GET & POST
		r.Get("/api/schools/count", schoolHandler.GetCount)
		r.Get("/api/schools/{id}", schoolHandler.GetById)

		// Сверено со Swagger: @Router /api/schools [post]
		r.Post("/api/schools", schoolHandler.Create)

		// users POST
		r.Post("/api/users/change-password/{id}", userHandler.ChangePassword)
		r.Post("/api/users/revoke/{id}", authHandler.RevokeToken)
		r.Post("/api/users/revoke-all/{id}", authHandler.RevokeAllUserTokens)

		// PUT
		r.Put("/api/users/{id}", userHandler.Update)
		r.Put("/api/participants/{id}", participantHandler.Update)
		r.Put("/api/schools/{id}", schoolHandler.Update)

		// DELETE
		r.Delete("/api/users/{id}", userHandler.Delete)
	})

	router.With(base_access.BaseAccess(jwtManager)).Group(func(r chi.Router) {
		// Получение полной таблицы заявок и модерация
		r.Get("/api/applications/full-details", applicationHandler.GetAllFullApplications)
		r.Patch("/api/applications/{id}/review", applicationHandler.ReviewApplication)
		r.Get("/api/users/{userID}/applications", applicationHandler.GetApplicationsByUserID)
		r.Post("/api/applications/{applicationID}/cancel", applicationHandler.CancelApplication)
		r.Patch("/api/applications/update-status/{applicationID}", applicationHandler.SwitchApplicationStatus)

		r.Route("/api/applications/{application_id}/portfolio", func(r chi.Router) {
			r.Post("/", portfolioHandler.CreatePortfolio)        // Multipart: file, description, achievements
			r.Get("/", portfolioHandler.GetByApplicationID)      // JSON просмотр
			r.Patch("/", portfolioHandler.Update)                // JSON редактирование полей
			r.Put("/file", portfolioHandler.UploadOrReplaceFile) // Multipart: замена файла
			r.Delete("/file", portfolioHandler.DeleteFile)       // Удаление файла
		})

		r.Route("/api/events", func(events chi.Router) {
			events.Get("/", eventHandler.GetAllOpen)
			events.Post("/", eventHandler.CreateEvent)
			events.Patch("/{id}/status", eventHandler.UpdateStatus)
			events.Post("/{id}/apply", eventHandler.ApplyToEvent)

		})
	})
}

func (a *App) initCors(router *chi.Mux, cfg config.AdditionalAddressesConfig) {
	corsOptions := cors.Options{
		AllowedOrigins: []string{cfg.ReactVision},
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

func (a *App) MustRun(ctx context.Context) {
	if err := a.Run(ctx); err != nil {
		panic(err)
	}
}

func (a *App) autoMigrate(ctx context.Context, dsn, driver, scheme, pathMigration string) error {
	if err := goose.SetDialect(scheme); err != nil {
		return err
	}

	db, err := goose.OpenDBWithDriver(driver, dsn)
	if err != nil {
		return err
	}
	defer func() {
		if errClose := db.Close(); errClose != nil {
			a.log.Error("failed to close migration db connection", "error", errClose)
		}
	}()

	if err := goose.UpContext(ctx, db, pathMigration); err != nil {
		a.log.Error("failed up command to migrate", liblogger.Err(err))
		return fmt.Errorf("failed up command: %w", err)
	}
	return nil
}

func (a *App) Run(ctx context.Context) error {
	const op = "app.Run"

	serverError := make(chan error, 2)
	go func() {
		if err := a.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverError <- err
		}
	}()
	a.log.Info("http server started")

	select {
	case <-ctx.Done():
		a.log.Info("shutting down server gracefully...")
		if err := a.Stop(); err != nil {
			return fmt.Errorf("%s: graceful shutdown failed: %w", op, err)
		}
		return nil
	case err := <-serverError:
		return fmt.Errorf("%s: server startup failed: %w", op, err)
	}
}

func (a App) Stop() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := a.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown with error: %w", err)
	}

	if a.grpcServer != nil {
		a.grpcServer.GracefulStop()
	}
	return nil
}
