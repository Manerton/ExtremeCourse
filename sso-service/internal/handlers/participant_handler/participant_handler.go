package participant_handler

import (
	"context"
	"encoding/json"
	participant_dto "main/internal/dto/participant"
	"main/internal/lib/errs"
	"main/internal/lib/parser"
	"main/internal/lib/response"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type ParticipantService interface {
	GetAll(ctx context.Context, page, limit *int) ([]participant_dto.ParticipantResponseDTO, error)
	GetById(ctx context.Context, id string) (participant_dto.ParticipantResponseDTO, error)
	GetByUserId(ctx context.Context, userId string) (participant_dto.ParticipantResponseDTO, error)

	GetCount(ctx context.Context) (int64, error)

	Update(ctx context.Context, id string, participantDTO participant_dto.UpdateParticipantRequestDTO) error
}

type ParticipantHandler struct {
	participantService ParticipantService
}

func New(participantSerivce ParticipantService) *ParticipantHandler {
	return &ParticipantHandler{
		participantService: participantSerivce,
	}
}

// @Summery Get count
// @Security BearerAuth
// @Description Получение количества участников
// @Tags participants
// @Produce json
// @Success 200 {object} response.ApiResponse{data=int}
// @Failure 400 {object} response.ApiResponse
// @Router /api/participants/count [get]
func (h *ParticipantHandler) GetCount(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	participantCount, err := h.participantService.GetCount(ctx)
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
		Data:       participantCount,
	})
}

// @Summery Get by id
// @Security BearerAuth
// @Description Получение данных о ученике по id
// @Tags participants
// @Produce json
// @Param id path string true "id ученика"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Router /api/participants/{id} [get]
func (h *ParticipantHandler) GetById(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")

	participantRes, err := h.participantService.GetById(ctx, id)
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
		Data:       participantRes,
	})
}

// @Summery Get by user id
// @Security BearerAuth
// @Description Получение данных о ученике по user id
// @Tags participants
// @Produce json
// @Param id path string true "id пользователя"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Router /api/participants/byuser/{id} [get]
func (h *ParticipantHandler) GetByUserId(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")
	participantRes, err := h.participantService.GetByUserId(ctx, id)
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
		Data:       participantRes,
	})
}

// @Summery Get all
// @Security BearerAuth
// @Description Получение всех учеников
// @Tags participants
// @Produce json
// @Param page query int false "Номер страницы"
// @Param limit query int false "Ограничение на количество записей"
// @Success 200 {object} response.ApiResponse{data=[]participant_dto.ParticipantResponseDTO}
// @Failure 400 {object} response.ApiResponse
// @Router /api/participants [get]
func (h *ParticipantHandler) GetAllParticipants(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, limit, err := parser.ParsePageLimit(pageStr, limitStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("incorrect page/limit")))
		return
	}

	participantResponse, err := h.participantService.GetAll(ctx, page, limit)
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
		Data:       participantResponse,
	})
}

// @Summery Update
// @Security BearerAuth
// @Description Обновление данных об ученике
// @Tags participants
// @Accept json
// @Produce json
// @Param credentials body participant_dto.UpdateParticipantRequestDTO true "Новые данные для обновления"
// @Param id path string true "id пользователя"
// @Success 200 {object} response.ApiResponse
// @Failure 400 {object} response.ApiResponse
// @Router /api/participants/{id} [put]
func (h *ParticipantHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")

	participantDTO := participant_dto.UpdateParticipantRequestDTO{}
	err := json.NewDecoder(r.Body).Decode(&participantDTO)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrBadRequest.Wrap("failed decode body update")))
		return
	}

	err = h.participantService.Update(ctx, id, participantDTO)
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

	render.Status(r, http.StatusOK)
	render.JSON(w, r, response.SuccessResponse("success update"))
}
