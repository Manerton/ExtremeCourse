package event_handler

import (
	"net/http"

	event_dto "main/internal/dto/event"
	"main/internal/lib/errs"
	"main/internal/lib/parser"
	"main/internal/lib/response"
	service "main/internal/services/event_service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type EventHandler struct {
	service *service.EventService
}

func New(s *service.EventService) *EventHandler {
	return &EventHandler{service: s}
}

// @Summary Create event
// @Security BearerAuth
// @Description Создание нового события/олимпиады (только для администраторов/организаторов)
// @Tags events
// @Accept json
// @Produce json
// @Param request body event_dto.CreateEventRequestDTO true "Данные события"
// @Success 200 {object} response.ApiResponse{data=map[string]string}
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/events [post]
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var dto event_dto.CreateEventRequestDTO
	if err := render.DecodeJSON(r.Body, &dto); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed to decode body")))
		return
	}

	id, err := h.service.CreateEvent(r.Context(), dto)
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

// @Summary Get open events
// @Security BearerAuth
// @Description Получение всех открытых для участия событий с пагинацией
// @Tags events
// @Produce json
// @Param page query int false "Номер страницы"
// @Param limit query int false "Количество на странице"
// @Success 200 {object} response.ApiResponse{data=[]event_dto.EventResponseDTO}
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/events [get]
func (h *EventHandler) GetAllOpen(w http.ResponseWriter, r *http.Request) {
	page, limit, err := parser.ParsePageLimit(r.URL.Query().Get("page"), r.URL.Query().Get("limit"))
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("invalid page/limit")))
		return
	}

	list, err := h.service.GetAllOpen(r.Context(), page, limit)
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

// @Summary Update event status
// @Security BearerAuth
// @Description Изменение статуса события (открыть/закрыть регистрацию)
// @Tags events
// @Accept json
// @Produce json
// @Param id path string true "ID события"
// @Param request body event_dto.UpdateEventStatusRequestDTO true "Новый статус (1 = Closed, 2 = Open)"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/events/{id}/status [patch]
func (h *EventHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "id")
	var dto event_dto.UpdateEventStatusRequestDTO
	if err := render.DecodeJSON(r.Body, &dto); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed to decode body")))
		return
	}

	if err := h.service.UpdateStatus(r.Context(), eventID, dto.Status); err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.SuccessResponse("event status updated"))
}

// @Summary Apply to event
// @Security BearerAuth
// @Description Подача заявки пользователем на участие в открытом событии
// @Tags events
// @Accept json
// @Produce json
// @Param id path string true "ID события"
// @Param request body event_dto.ApplyEventRequestDTO true "Данные заявки"
// @Success 200 {object} response.ApiResponse{data=map[string]string}
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/events/{id}/apply [post]
func (h *EventHandler) ApplyToEvent(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "id")

	var dto event_dto.ApplyEventRequestDTO
	if err := render.DecodeJSON(r.Body, &dto); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed to decode body")))
		return
	}

	appID, err := h.service.ApplyToEvent(r.Context(), eventID, dto.UserId)
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
		Data:       map[string]string{"application_id": appID.String()},
	})
}

// @Summary Review application (approve/reject)
// @Security BearerAuth
// @Description Модерация заявки (одобрение = 2 или отклонение = 3)
// @Tags events
// @Accept json
// @Produce json
// @Param application_id path string true "ID заявки"
// @Param request body event_dto.ReviewApplicationRequestDTO true "Решение по заявке"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/applications/{application_id}/review [patch]
func (h *EventHandler) ReviewApplication(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "application_id")
	var dto event_dto.ReviewApplicationRequestDTO
	if err := render.DecodeJSON(r.Body, &dto); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed to decode body")))
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

	render.JSON(w, r, response.SuccessResponse("application status updated successfully"))
}
