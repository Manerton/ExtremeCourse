package response

import (
	"main/internal/lib/errs"
	"net/http"
)

const (
	SUCCESS = "success"
	ERROR   = "error"
)

type ApiResponse struct {
	Status     string      `json:"status"`
	StatusCode int         `json:"status_code"`
	Data       interface{} `json:"data,omitempty"`
	ErrorCode  string      `json:"error,omitempty"`
	Message    string      `json:"message,omitempty"`
	Metadata   interface{} `json:"metadata,omitempty"`
}

func ErrorApiResponse(err *errs.ApiError) ApiResponse {
	return ApiResponse{
		Status:     ERROR,
		StatusCode: err.HttpCode,
		ErrorCode:  err.Code,
		Message:    err.Message,
	}
}

func SuccessResponse(msg string) ApiResponse {
	return ApiResponse{
		Status:     SUCCESS,
		StatusCode: http.StatusOK,
		Message:    msg,
	}
}
