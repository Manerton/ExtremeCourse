package ApplicationHandler

import (
	"fmt"
	ApplicationDto "main/internal/dto/applications"
	"main/internal/lib/parser"
	"main/internal/lib/response"
	"main/internal/services/application_service"
	"net/http"

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
	// id, err := uuid.Parse(idStr)
	// if err != nil {
	// 	h.logger.Error("Некорректный UUID заявки", slog.Any("error", err))
	// 	http.Error(w, "Некорректный UUID заявки", http.StatusBadRequest)
	// 	return
	// }

	h.logger.Info("Получение заявки по ID", slog.Any("id", idStr))
	application, err := h.service.GetApplicationByID(ctx, idStr)
	if err != nil {
		h.logger.Error("Ошибка получения заявки", slog.Any("error", err))
		http.Error(w, "Заявка не найдена", http.StatusNotFound)
		return
	}
	//render.JSON(w, r, application)
	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       application,
	})
}

// Получение заявок пользователя по ID
func (h *ApplicationHandler) GetApplicationsByUserID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := chi.URLParam(r, "userID")
	// userID, err := uuid.Parse(idStr)
	// if err != nil {
	// 	h.logger.Error("Некорректный userID", slog.Any("error", err))
	// 	http.Error(w, "Некорректный userID", http.StatusBadRequest)
	// 	return
	// }

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, limit, err := parser.ParsePageLimit(pageStr, limitStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorResponse("failed parse page/limit"))
		return
	}

	h.logger.Info("Получение заявок пользователя", slog.Any("userID", idStr))
	applications, err := h.service.GetApplicationsByUserID(ctx, idStr, page, limit)
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

// Получение заявок по ID события
func (h *ApplicationHandler) GetApplicationsByEventID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := chi.URLParam(r, "eventID")
	// eventID, err := uuid.Parse(idStr)
	// if err != nil {
	// 	h.logger.Error("Некорректный eventID", slog.Any("error", err))
	// 	http.Error(w, "Некорректный eventID", http.StatusBadRequest)
	// 	return
	// }

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
	// id, err := uuid.Parse(idStr)
	// if err != nil {
	// 	h.logger.Error("Некорректный UUID заявки", slog.Any("error", err))
	// 	http.Error(w, "Некорректный UUID заявки", http.StatusBadRequest)
	// 	return
	// }

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
	// id, err := uuid.Parse(idStr)
	// if err != nil {
	// 	h.logger.Error("Некорректный UUID заявки", slog.Any("error", err))
	// 	http.Error(w, "Некорректный UUID заявки", http.StatusBadRequest)
	// 	return
	// }

	h.logger.Info("Удаление заявки", slog.Any("id", idStr))
	if err := h.service.DeleteApplication(ctx, idStr); err != nil {
		h.logger.Error("Ошибка удаления заявки", slog.Any("error", err))
		http.Error(w, "Не удалось удалить заявку", http.StatusInternalServerError)
		return
	}

	//render.JSON(w, r, map[string]interface{}{"message": "Заявка удалена"})
	render.JSON(w, r, response.SuccessResponse("Заявка удалена"))
}

/* // Пример: Получение информации о событии
type EventDetails struct {
	Name     string `json:"name"`
	Location string `json:"location"`
}

// Запрос в сервис событий (Event Service)
func getEventDetails(eventID uint) (EventDetails, error) {
	// HTTP-запрос к Event Service
	resp, err := http.Get(fmt.Sprintf("http://event-service/events/%d", eventID))
	if err != nil {
		return EventDetails{}, err
	}
	defer resp.Body.Close()

	var details EventDetails
	if err := json.NewDecoder(resp.Body).Decode(&details); err != nil {
		return EventDetails{}, err
	}

	return details, nil
} */

/* func syncEventDetails(application *Application) error {
	details, err := getEventDetails(application.EventID)
	if err != nil {
		return err
	}

	application.EventName = details.Name
	application.EventLocation = details.Location
	return nil
} */
