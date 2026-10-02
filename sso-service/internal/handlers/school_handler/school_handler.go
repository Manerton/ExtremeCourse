package school_handler

import (
	"context"
	link_dto "main/internal/dto/link"
	school_dto "main/internal/dto/school"
	"main/internal/lib/errs"
	"main/internal/lib/parser"
	"main/internal/lib/response"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

type SchoolService interface {
	GetAll(ctx context.Context, page, limit *int) ([]school_dto.SchoolResponseDTO, error)
	GetById(ctx context.Context, id string) (school_dto.SchoolResponseDTO, error)
	GetAllByDistrict(ctx context.Context, districtId string) ([]school_dto.SchoolResponseDTO, error)

	GetCount(ctx context.Context) (int64, error)

	Create(ctx context.Context, schoolDTO school_dto.CreateSchoolRequestDTO) (uuid.UUID, error)
	Update(ctx context.Context, id string, schoolDTO school_dto.UpdateSchoolRequestDTO) error
}

type LinkService interface {
	GetLinks(ctx context.Context, region string) ([]link_dto.LinkDTO, error)
}

type SchoolHandler struct {
	schoolService SchoolService
}

func New(schoolService SchoolService) *SchoolHandler {
	return &SchoolHandler{
		schoolService: schoolService,
	}
}

// @Summery count
// @Security BearerAuth
// @Description Получение количества школ
// @Tags schools
// @Produce json
// @Success 200 {object} response.ApiResponse{data=int}
// @Failure 400 {object} response.ApiResponse
// @Router /api/schools/count [get]
func (h *SchoolHandler) GetCount(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	schoolCount, err := h.schoolService.GetCount(ctx)
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
		Data:       schoolCount,
	})

}

func (h *SchoolHandler) GetAllByDistrict(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")

	result, err := h.schoolService.GetAllByDistrict(ctx, id)
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
		Data:       result,
	})
}

// @Summery all
// @Security BearerAuth
// @Description Получение всех школ
// @Tags schools
// @Produce json
// @Param page query int false "Номер страницы"
// @Param limit query int false "Ограничение на количество записей"
// @Success 200 {object} response.ApiResponse{data=[]school_dto.SchoolResponseDTO}
// @Failure 400 {object} response.ApiResponse
// @Router /api/schools [get]
func (h *SchoolHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, limit, err := parser.ParsePageLimit(pageStr, limitStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("incorrect page/limit")))
		return
	}

	schoolResponse, err := h.schoolService.GetAll(ctx, page, limit)
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
		Data:       schoolResponse,
	})
}

// @Summery by id
// @Security BearerAuth
// @Description Получение школы по id
// @Tags schools
// @Produce json
// @Param id path string true "id школы"
// @Success 200 {object} response.ApiResponse{data=school_dto.SchoolResponseDTO}
// @Failure 400 {object} response.ApiResponse
// @Router /api/schools/{id} [get]
func (h *SchoolHandler) GetById(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")

	schoolResponse, err := h.schoolService.GetById(ctx, id)
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
		Data:       schoolResponse,
	})
}

// @Summery create
// @Security BearerAuth
// @Description Создание школы
// @Tags schools
// @Accept json
// @Produce json
// @Param credentials body school_dto.CreateSchoolRequestDTO true "Данные для создания школы"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Router /api/schools [post]
func (h *SchoolHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	schoolDTO := school_dto.CreateSchoolRequestDTO{}
	err := render.DecodeJSON(r.Body, &schoolDTO)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed decode body")))
		return
	}

	_, err = h.schoolService.Create(ctx, schoolDTO)
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

	render.JSON(w, r, response.SuccessResponse("success create"))
}

// @Summery update
// @Security BearerAuth
// @Description Обновление школы
// @Tags schools
// @Accept json
// @Produce json
// @Param credentials body school_dto.UpdateSchoolRequestDTO true "Данные для обновления школы"
// @Param id path string true "id пользователя"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Router /api/schools/{id} [put]
func (h *SchoolHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")

	schoolDTO := school_dto.UpdateSchoolRequestDTO{}
	err := render.DecodeJSON(r.Body, &schoolDTO)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed decode body")))
		return
	}

	err = h.schoolService.Update(ctx, id, schoolDTO)
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

	render.JSON(w, r, response.SuccessResponse("success update"))
}
