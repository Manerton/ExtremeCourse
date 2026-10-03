package link_handler

import (
	"context"
	link_dto "main/internal/dto/link"
	"main/internal/lib/errs"
	"main/internal/lib/response"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type LinkServiceInterface interface {
	GetLinks(ctx context.Context, region string) ([]link_dto.LinkDTO, error)
}

type LinkHandler struct {
	linkService LinkServiceInterface
}

func New(linkService LinkServiceInterface) *LinkHandler {
	return &LinkHandler{
		linkService: linkService,
	}
}

func (h *LinkHandler) GetLinks(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	region := chi.URLParam(r, "region")

	links, err := h.linkService.GetLinks(ctx, region)
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
		Data:       links,
	})
}
