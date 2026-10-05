package application_handler

import (
	"errors"
	"fmt"
	ApplicationDto "main/internal/dto/applications"
	"main/internal/lib/errs"
	"main/internal/lib/parser"
	"main/internal/lib/response"
	"main/internal/services/application_service"
	"net/http"
	"strings"

	"log/slog"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	//"github.com/go-playground/validator/v10"
)

type ApplicationHandler struct {
	service *application_service.ApplicationService
	logger  *slog.Logger
}

// Конструктор обработчика заявок
func NewApplicationHandler(service *application_service.ApplicationService, logger *slog.Logger) *ApplicationHandler {
	return &ApplicationHandler{service: service, logger: logger}
}

// @Summary Get all full applications
// @Security BearerAuth
// @Description Получение полного списка заявок с данными о пользователях, их школах и событиях
// @Tags applications
// @Produce json
// @Param page query int false "Номер страницы"
// @Param limit query int false "Элементов на странице"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/applications/full-details [get]
func (h *ApplicationHandler) GetAllFullApplications(w http.ResponseWriter, r *http.Request) {
	page, limit, err := parser.ParsePageLimit(r.URL.Query().Get("page"), r.URL.Query().Get("limit"))
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("invalid page or limit")))
		return
	}

	items, err := h.service.GetAllFullApplications(r.Context(), page, limit)
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
		Data:       items,
	})
}

// @Summary Review application (approve or reject)
// @Security BearerAuth
// @Description Одобрение (2) или отклонение (3) заявки модератором
// @Tags applications
// @Accept json
// @Produce json
// @Param id path string true "ID заявки"
// @Param request body ApplicationDto.UpdateApplicationDTO true "Новый статус (2 - одобрено, 3 - отклонено)"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/applications/{id}/review [patch]
func (h *ApplicationHandler) ReviewApplication(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")

	var dto ApplicationDto.UpdateApplicationDTO
	if err := render.DecodeJSON(r.Body, &dto); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed decode json body")))
		return
	}

	if err := h.service.ReviewApplication(r.Context(), appID, dto.Status); err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.SuccessResponse("status updated"))
}

func (h *ApplicationHandler) GetCountApplications(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	AppCount, err := h.service.GetCount(ctx)
	if err != nil {
		h.logger.Error("Ошибка получения количества заявок", slog.Any("error", err))
		http.Error(w, "Не удалось получить заявки", http.StatusInternalServerError)
		return
	}

	render.JSON(w, r, response.ApiResponse{
		Status: response.SUCCESS,
		Data:   AppCount,
	})

}

func (h *ApplicationHandler) GetByFilter(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	//////////////////////////////////////
	/////////////НАДО ПРОВЕРЯТЬ///////////
	orderStr := r.URL.Query().Get("order")
	//////////////////////////////////////
	/////////////НАДО ПРОВЕРЯТЬ///////////
	page, limit, err := parser.ParsePageLimit(pageStr, limitStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("failed parse page/limit"))
		return
	}

	searchDTO := ApplicationDto.ApplicationResponseDTO{}
	err = render.DecodeJSON(r.Body, &searchDTO)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("failed decode json"))
		return
	}

	userResponse, err := h.service.GetAllByFilter(ctx, searchDTO, page, limit, orderStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("failed find user"))
		return
	}

	render.Status(r, http.StatusOK)
	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       userResponse,
	})

}

// Получение всех заявок
func (h *ApplicationHandler) GetAllApplications(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, limit, err := parser.ParsePageLimit(pageStr, limitStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("failed parse page/limit"))
		return
	}

	h.logger.Info("Получение всех заявок")
	applications, err := h.service.GetAllApplications(ctx, page, limit)

	if err != nil {
		h.logger.Error("Ошибка получения всех заявок", slog.Any("error", err))
		http.Error(w, "Не удалось получить заявки", http.StatusInternalServerError)
		return
	}
	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       applications,
	})

}

// Получение заявки по ID
func (h *ApplicationHandler) GetApplicationByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := chi.URLParam(r, "id")

	h.logger.Info("Получение заявки по ID", slog.Any("id", idStr))
	application, err := h.service.GetApplicationByID(ctx, idStr)
	if err != nil {
		h.logger.Error("Ошибка получения заявки", slog.Any("error", err))
		http.Error(w, "Заявка не найдена", http.StatusNotFound)
		return
	}
	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       application,
	})
}

// GetApplicationsByUserID получает список заявок конкретного пользователя с пагинацией
// @Summary      Получение заявок пользователя
// @Security BearerAuth
// @Description  Возвращает список всех поданных заявок пользователя по его UUID
// @Tags         applications
// @Accept       json
// @Produce      json
// @Param        userID   path      string  true   "UUID пользователя" Format(uuid)
// @Success      200      {object}  response.ApiResponse{data=[]models.Application} "Список заявок"
// @Failure      400      {object}  response.ApiResponse "Неверные параметры пагинации или UUID"
// @Failure      500      {object}  response.ApiResponse "Ошибка получения данных"
// @Router       /api/users/{userID}/applications [get]
func (h *ApplicationHandler) GetApplicationsByUserID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := chi.URLParam(r, "userID")

	h.logger.Info("Получение заявок пользователя", slog.Any("userID", idStr))
	applications, err := h.service.GetApplicationsByUserID(ctx, idStr)
	if err != nil {
		h.logger.Error("Ошибка получения заявок пользователя", slog.Any("error", err))
		http.Error(w, "Не удалось получить заявки", http.StatusInternalServerError)
		return
	}
	//render.JSON(w, r, applications)
	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       applications,
	})
}

// CancelApplication отменяет заявку пользователя
// @Summary      Отмена заявки
// @Security BearerAuth
// @Description  Отзывает ранее поданную заявку (доступно до 12.10.2026 включительно)
// @Tags         applications
// @Accept       json
// @Produce      json
// @Param        applicationID   path      string  true  "UUID заявки"  Format(uuid)
// @Success      200             {object}  response.ApiResponse  "Заявка успешно отменена"
// @Failure      400             {object}  response.ApiResponse  "Некорректный ID заявки или дедлайн истек"
// @Failure      500             {object}  response.ApiResponse  "Внутренняя ошибка сервера"
// @Router       /api/applications/{applicationID}/cancel [post]
func (h *ApplicationHandler) CancelApplication(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	appIDStr := chi.URLParam(r, "applicationID")

	if appIDStr == "" {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("missing application ID"))
		return
	}

	h.logger.Info("Отмена заявки", slog.String("applicationID", appIDStr))

	err := h.service.CancelApplication(ctx, appIDStr)
	if err != nil {
		h.logger.Error("Ошибка при отмене заявки", slog.String("applicationID", appIDStr), slog.Any("error", err))

		// Если ошибка связана с некорректным ID или дедлайном
		if errors.Is(err, errs.ErrBadRequest) || strings.Contains(err.Error(), "deadline") {
			render.Status(r, http.StatusBadRequest)
			render.JSON(w, r, response.ErrorResponse(err.Error()))
			return
		}

		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorResponse("failed to cancel application"))
		return
	}

	render.Status(r, http.StatusOK)
	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       "application cancelled successfully",
	})
}

// Получение заявок по ID события
func (h *ApplicationHandler) GetApplicationsByEventID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := chi.URLParam(r, "eventID")

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, limit, err := parser.ParsePageLimit(pageStr, limitStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("failed parse page/limit"))
		return
	}

	h.logger.Info("Получение заявок по ID события", slog.Any("eventID", idStr))
	applications, err := h.service.GetApplicationsByEventID(ctx, idStr, page, limit)
	if err != nil {
		h.logger.Error("Ошибка получения заявок события", slog.Any("error", err))
		http.Error(w, "Не удалось получить заявки", http.StatusInternalServerError)
		return
	}
	//render.JSON(w, r, applications)
	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       applications,
	})
}

func (h *ApplicationHandler) GetApplicationsBySchoolID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := chi.URLParam(r, "schoolID")

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, limit, err := parser.ParsePageLimit(pageStr, limitStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("failed parse page/limit"))
		return
	}

	h.logger.Info("Получение заявок по ID школы", slog.Any("eventID", idStr))
	applications, err := h.service.GetApplicationsBySchoolID(ctx, idStr, page, limit)
	if err != nil {
		h.logger.Error("Ошибка получения заявок по ID школы", slog.Any("error", err))
		http.Error(w, "Не удалось получить заявки", http.StatusInternalServerError)
		return
	}
	//render.JSON(w, r, applications)
	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       applications,
	})
}

func (h *ApplicationHandler) GetApplicationsBySchoolListID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var data map[string][]string
	err := render.DecodeJSON(r.Body, &data)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("failed decode request"))
		return
	}

	// Получаем ids по ключу
	ids, exists := data["ids"] ///TODO ГОВНОКОД
	if !exists {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("ids field is required"))
		return
	}

	h.logger.Info("Получение заявок по ID школы/муницапалитета", slog.Any("ID", ids))
	ApplicationsBySchoolList, err := h.service.GetApplicationsBySchoolListID(ctx, ids)
	if err != nil {
		h.logger.Error("Ошибка получения заявок по массиву ID школ", slog.Any("error", err))
		http.Error(w, "Не удалось получить заявки", http.StatusInternalServerError)
		return
	}

	render.JSON(w, r, response.ApiResponse{
		Status: response.SUCCESS,
		Data:   ApplicationsBySchoolList,
	})
}

// Создание новой заявки
func (h *ApplicationHandler) CreateApplication(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var input ApplicationDto.CreateApplicationDTO
	if err := render.DecodeJSON(r.Body, &input); err != nil {
		h.logger.Error("Ошибка декодирования данных", slog.Any("error", err))
		http.Error(w, "Некорректные данные", http.StatusBadRequest)
		return
	}

	h.logger.Info("Валидация данных заявки", slog.Any("input", input))

	h.logger.Info("Создание новой заявки", slog.Any("user_id", input.UserID))
	id, err := h.service.CreateApplication(ctx, input)
	if err != nil {
		h.logger.Error("Ошибка создания заявки", slog.Any("error", err))
		http.Error(w, "Не удалось создать заявку", http.StatusInternalServerError)
		return
	}
	render.JSON(w, r, map[string]interface{}{"application_id": id})
}

func (h *ApplicationHandler) SetParticipantCode(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	eventIDStr := chi.URLParam(r, "id")
	err := h.service.SetParticipantCode(ctx, eventIDStr)
	if err != nil {
		h.logger.Error("Ошибка назначения кода участника", slog.Any("error", err))
		http.Error(w, "Не удалось назначить кода участника", http.StatusInternalServerError)
		return
	}

	render.JSON(w, r, response.SuccessResponse("Коды выставленны успешно"))
}

// Обновление статуса заявки
func (h *ApplicationHandler) UpdateApplicationStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := chi.URLParam(r, "id")

	var input ApplicationDto.UpdateApplicationDTO
	if err := render.DecodeJSON(r.Body, &input); err != nil {
		h.logger.Error("Ошибка декодирования данных", slog.Any("error", err))
		http.Error(w, "Некорректные данные", http.StatusBadRequest)
		return
	}

	h.logger.Info("Обновление статуса заявки", slog.Any("id", idStr), slog.Any("status", input.Status))
	if err := h.service.UpdateApplication(ctx, idStr, input); err != nil {
		h.logger.Error("Ошибка обновления статуса заявки", slog.Any("error", err))
		http.Error(w, "Не удалось обновить статус", http.StatusInternalServerError)
		return
	}
	//render.JSON(w, r, map[string]interface{}{"message": "Статус заявки обновлен"})
	render.JSON(w, r, response.SuccessResponse(fmt.Sprintf("id = %s", idStr)))
}

// Удаление заявки
func (h *ApplicationHandler) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := chi.URLParam(r, "id")

	h.logger.Info("Удаление заявки", slog.Any("id", idStr))
	if err := h.service.DeleteApplication(ctx, idStr); err != nil {
		h.logger.Error("Ошибка удаления заявки", slog.Any("error", err))
		http.Error(w, "Не удалось удалить заявку", http.StatusInternalServerError)
		return
	}

	//render.JSON(w, r, map[string]interface{}{"message": "Заявка удалена"})
	render.JSON(w, r, response.SuccessResponse("Заявка удалена"))
}
