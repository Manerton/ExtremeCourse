package district_handler

import (
	"context"
	district_dto "main/internal/dto/district"
	"main/internal/lib/errs"
	"main/internal/lib/response"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type DistrictServiceInterface interface {
	GetAllByRegion(ctx context.Context, region string) ([]district_dto.DistrictDTOResponse, error)
	GetByID(ctx context.Context, id string) (district_dto.DistrictDTOResponse, error)
}

type DistrictHandler struct {
	service DistrictServiceInterface
}

func New(service DistrictServiceInterface) *DistrictHandler {
	return &DistrictHandler{
		service: service,
	}
}

func (h *DistrictHandler) GetAllByRegion(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	region := chi.URLParam(r, "region")
	result, err := h.service.GetAllByRegion(ctx, region)
	if err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
	}

	render.JSON(w, r, response.ApiResponse{
		StatusCode: http.StatusOK,
		Status:     response.SUCCESS,
		Data:       result,
	})
}

func (h *DistrictHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")
	result, err := h.service.GetByID(ctx, id)
	if err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
	}

	render.JSON(w, r, response.ApiResponse{
		Status:     response.SUCCESS,
		StatusCode: http.StatusOK,
		Data:       result,
	})
}
