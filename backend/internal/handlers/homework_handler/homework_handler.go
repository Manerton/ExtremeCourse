package homework_handler

import (
	"net/http"

	homework_dto "main/internal/dto/homework"
	"main/internal/lib/errs"
	"main/internal/lib/response"
	service "main/internal/services/homework_service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type HomeworkHandler struct {
	service *service.HomeworkService
}

func New(s *service.HomeworkService) *HomeworkHandler {
	return &HomeworkHandler{service: s}
}

// @Summary Create homework
// @Security BearerAuth
// @Description Создание новой домашней работы с указанием сроков публикации и дедлайна
// @Tags homeworks
// @Accept json
// @Produce json
// @Param request body homework_dto.CreateHomeworkRequestDTO true "Данные для создания домашней работы"
// @Success 200 {object} response.ApiResponse{data=map[string]string}
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/homeworks [post]
func (h *HomeworkHandler) CreateHomework(w http.ResponseWriter, r *http.Request) {
	var dto homework_dto.CreateHomeworkRequestDTO
	if err := render.DecodeJSON(r.Body, &dto); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed to decode body")))
		return
	}

	id, err := h.service.CreateHomework(r.Context(), dto)
	if err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       map[string]string{"id": id.String()},
	})
}

// @Summary Create task
// @Security BearerAuth
// @Description Создание задачи с вариантами правильных ответов и баллами
// @Tags homeworks
// @Accept json
// @Produce json
// @Param request body homework_dto.CreateTaskRequestDTO true "Данные для создания задачи"
// @Success 200 {object} response.ApiResponse{data=map[string]string}
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/tasks [post]
func (h *HomeworkHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	var dto homework_dto.CreateTaskRequestDTO
	if err := render.DecodeJSON(r.Body, &dto); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed to decode body")))
		return
	}

	id, err := h.service.CreateTask(r.Context(), dto)
	if err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       map[string]string{"id": id.String()},
	})
}

// @Summary Add task to homework
// @Security BearerAuth
// @Description Прикрепление существующей задачи к домашней работе
// @Tags homeworks
// @Accept json
// @Produce json
// @Param homework_id path string true "ID домашней работы (UUID)"
// @Param request body homework_dto.AddTaskToHomeworkDTO true "ID задачи для прикрепления"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/homeworks/{homework_id}/tasks [post]
func (h *HomeworkHandler) AddTaskToHomework(w http.ResponseWriter, r *http.Request) {
	hwID := chi.URLParam(r, "homework_id")
	var dto homework_dto.AddTaskToHomeworkDTO
	if err := render.DecodeJSON(r.Body, &dto); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed to decode body")))
		return
	}

	if err := h.service.AddTaskToHomework(r.Context(), hwID, dto.TaskID); err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.SuccessResponse("task linked to homework"))
}

// @Summary Get available homeworks
// @Security BearerAuth
// @Description Получение списка всех опубликованных и активных домашних работ
// @Tags homeworks
// @Produce json
// @Success 200 {object} response.ApiResponse{data=[]homework_dto.HomeworkResponseDTO}
// @Failure 500 {object} response.ApiResponse
// @Router /api/homeworks [get]
func (h *HomeworkHandler) GetAvailableHomeworks(w http.ResponseWriter, r *http.Request) {
	list, err := h.service.GetAvailableHomeworks(r.Context())
	if err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       list,
	})
}

// @Summary Submit homework
// @Security BearerAuth
// @Description Сдача домашней работы пользователем с автоматической проверкой ответов (повторная сдача запрещена)
// @Tags homeworks
// @Accept json
// @Produce json
// @Param homework_id path string true "ID домашней работы (UUID)"
// @Param X-User-ID header string false "ID пользователя (UUID), если передается через заголовок"
// @Param request body homework_dto.SubmitHomeworkRequestDTO true "Ответы пользователя на задачи"
// @Success 200 {object} response.ApiResponse{data=homework_dto.SubmissionResponseDTO}
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/homeworks/{homework_id}/submit [post]
func (h *HomeworkHandler) SubmitHomework(w http.ResponseWriter, r *http.Request) {
	hwID := chi.URLParam(r, "homework_id")
	// userID извлекается из контекста авторизации или заголовка
	userID := r.Header.Get("X-User-ID")

	var dto homework_dto.SubmitHomeworkRequestDTO
	if err := render.DecodeJSON(r.Body, &dto); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed to decode body")))
		return
	}

	res, err := h.service.SubmitHomework(r.Context(), hwID, userID, dto)
	if err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       res,
	})
}

// @Summary Get homework leaderboard
// @Security BearerAuth
// @Description Получение рейтинга учеников по конкретной домашней работе
// @Tags homeworks
// @Produce json
// @Param homework_id path string true "ID домашней работы (UUID)"
// @Success 200 {object} response.ApiResponse{data=[]homework_dto.StudentHomeworkLeaderboardDTO}
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/homeworks/{homework_id}/leaderboard [get]
func (h *HomeworkHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	hwID := chi.URLParam(r, "homework_id")
	stats, err := h.service.GetLeaderboard(r.Context(), hwID)
	if err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       stats,
	})
}
