package portfolio_handler

import (
	"encoding/json"
	"errors"
	"net/http"

	dto "main/internal/dto/portfolio"
	"main/internal/lib/errs"
	"main/internal/lib/response"
	service "main/internal/services/portfolio_service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

type PortfolioHandler struct {
	service *service.PortfolioService
}

func New(s *service.PortfolioService) *PortfolioHandler {
	return &PortfolioHandler{service: s}
}

// @Summary Upload application portfolio
// @Security BearerAuth
// @Description Загрузка портфолио участника вместе с файлом и списком достижений
// @Tags portfolio
// @Accept multipart/form-data
// @Produce json
// @Param application_id path string true "ID заявки"
// @Param description formData string false "Описание портфолио"
// @Param achievements formData []string false "Список кодов достижений (или JSON-массив строкой)"
// @Param file formData file false "Файл с портфолио"
// @Success 201 {object} response.ApiResponse{data=map[string]string}
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/applications/{application_id}/portfolio [post]
func (h *PortfolioHandler) CreatePortfolio(w http.ResponseWriter, r *http.Request) {
	appIDStr := chi.URLParam(r, "application_id")
	appID, err := uuid.Parse(appIDStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("invalid application id")))
		return
	}

	// Ограничиваем размер входящего запроса (например, 25 МБ)
	if err := r.ParseMultipartForm(100 << 20); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("invalid multipart form")))
		return
	}

	description := r.FormValue("description")
	// Достижения могут приходить либо массивом строк (несколько полей "achievements"), либо JSON-строкой
	achievements := r.Form["achievements"]
	if len(achievements) == 0 && r.FormValue("achievements") != "" {
		_ = json.Unmarshal([]byte(r.FormValue("achievements")), &achievements)
	}

	file, header, fileErr := r.FormFile("file")
	var filename string
	if fileErr == nil {
		defer file.Close()
		filename = header.Filename
	}

	id, err := h.service.CreatePortfolio(r.Context(), appID, description, achievements, filename, file)
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
		StatusCode: http.StatusCreated,
		Data:       map[string]string{"portfolio_id": id.String()},
	})
}

// @Summary Get application portfolio
// @Security BearerAuth
// @Description Получение портфолио по ID заявки
// @Tags portfolio
// @Produce json
// @Param application_id path string true "ID заявки"
// @Success 200 {object} response.ApiResponse{data=portfolio_dto.PortfolioResponseDTO}
// @Failure 400 {object} response.ApiResponse
// @Failure 404 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/applications/{application_id}/portfolio [get]
func (h *PortfolioHandler) GetByApplicationID(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "application_id")
	res, err := h.service.GetByApplicationID(r.Context(), appID)
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

// @Summary Update portfolio info and file
// @Security BearerAuth
// @Description Обновление описания, достижений и/или файла портфолио
// @Tags portfolio
// @Accept multipart/form-data
// @Produce json
// @Param application_id path string true "ID заявки"
// @Param description formData string false "Новое описание портфолио"
// @Param achievements formData []string false "Список кодов достижений (или JSON-массив строкой)"
// @Param file formData file false "Новый файл портфолио (опционально, заменяет существующий)"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/applications/{application_id}/portfolio [patch]
func (h *PortfolioHandler) Update(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "application_id")

	if err := r.ParseMultipartForm(100 << 20); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("invalid multipart form")))
		return
	}

	updateDTO := dto.UpdatePortfolioDTO{}

	// Читаем description, если поле присутствует в multipart-запросе
	if _, exists := r.MultipartForm.Value["description"]; exists {
		desc := r.FormValue("description")
		updateDTO.Description = &desc
	}

	// Читаем achievements (как массив параметров или как JSON-строку)
	if _, exists := r.MultipartForm.Value["achievements"]; exists {
		achievements := r.Form["achievements"]
		if len(achievements) == 0 && r.FormValue("achievements") != "" {
			_ = json.Unmarshal([]byte(r.FormValue("achievements")), &achievements)
		}
		updateDTO.CodeAchievement = achievements
	}

	// Читаем файл, если он прикреплен
	file, header, err := r.FormFile("file")
	if err == nil {
		defer file.Close()
		updateDTO.Filename = header.Filename
		updateDTO.FileReader = file
	} else if !errors.Is(err, http.ErrMissingFile) {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed to parse uploaded file")))
		return
	}

	if err := h.service.UpdatePortfolio(r.Context(), appID, updateDTO); err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.SuccessResponse("portfolio updated successfully"))
}

// @Summary Upload or replace portfolio file
// @Security BearerAuth
// @Description Прикрепление нового или замена существующего файла портфолио
// @Tags portfolio
// @Accept multipart/form-data
// @Produce json
// @Param application_id path string true "ID заявки"
// @Param file formData file true "Новый файл портфолио"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/applications/{application_id}/portfolio/file [put]
func (h *PortfolioHandler) UploadOrReplaceFile(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "application_id")

	if err := r.ParseMultipartForm(100 << 20); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("invalid multipart form")))
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("missing file in form field 'file'")))
		return
	}
	defer file.Close()

	if err := h.service.ReplaceFile(r.Context(), appID, header.Filename, file); err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.SuccessResponse("file updated successfully"))
}

// @Summary Delete portfolio file
// @Security BearerAuth
// @Description Удаление прикрепленного файла портфолио
// @Tags portfolio
// @Produce json
// @Param application_id path string true "ID заявки"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Failure 500 {object} response.ApiResponse
// @Router /api/applications/{application_id}/portfolio/file [delete]
func (h *PortfolioHandler) DeleteFile(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "application_id")

	if err := h.service.DeleteFile(r.Context(), appID); err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}

	render.JSON(w, r, response.SuccessResponse("file deleted successfully"))
}
