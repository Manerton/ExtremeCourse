package errs

import (
	"fmt"
	"net/http"
)

type ApiError struct {
	Code     string
	HttpCode int
	Message  string
}

func (e *ApiError) Error() string {
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (e *ApiError) Wrap(message string) *ApiError {
	return &ApiError{
		Code:     e.Code,
		HttpCode: e.HttpCode,
		Message:  message,
	}
}

func IsApiError(err error) (*ApiError, bool) {
	apiErr, ok := err.(*ApiError)
	return apiErr, ok
}

// Common errors
var (
	ErrInternalError = &ApiError{Code: "INTERNAL_SERVER_ERROR", HttpCode: http.StatusInternalServerError, Message: "Something was wrong"}
	ErrBadRequest    = &ApiError{Code: "BAD_REQUEST", HttpCode: http.StatusBadRequest, Message: "Invalid data"}
)

// Token errors
var (
	ErrTokenNotFound = &ApiError{Code: "TOKEN_NOT_FOUND", HttpCode: http.StatusNotFound, Message: "Token is missing"}
	ErrAccessToken   = &ApiError{Code: "ACCESS_TOKEN_GENERATION_FAILED", HttpCode: http.StatusInternalServerError, Message: "Ошибка при создании access токена"}
	ErrRefreshToken  = &ApiError{Code: "REFRESH_TOKEN_GENERATION_FAILED", HttpCode: http.StatusInternalServerError, Message: "Ошибка при создании refresh токена"}
	ErrRevokedToken  = &ApiError{Code: "REVOKED_TOKEN", HttpCode: http.StatusBadRequest, Message: "token was be revoked"}
)

// Auth errors
var (
	ErrAuthFailed             = &ApiError{Code: "AUTH_FAILED", HttpCode: http.StatusUnauthorized, Message: "Failed"}
	ErrUserAlreadyExists      = &ApiError{Code: "USER_ALREADY_EXISTS", HttpCode: http.StatusConflict, Message: "Пользователь с таким email уже существует"}
	ErrInvalidActivationCode  = &ApiError{Code: "INVALID_ACTIVATION_CODE", HttpCode: http.StatusBadRequest, Message: "Invalid activation code"}
	ErrActivationCodeNotFound = &ApiError{Code: "ACTIVATION_CODE_NOT_FOUND", HttpCode: http.StatusBadRequest, Message: "Activation code not found"}
)

// User errors
var (
	ErrUserNotFound      = &ApiError{Code: "USER_NOT_FOUND", HttpCode: http.StatusNotFound, Message: "User not found"}
	ErrUserNotFoundEmail = &ApiError{Code: "USER_NOT_FOUND_EMAIL", HttpCode: http.StatusNotFound}
)

// Participant error
var (
	ErrParticipantNotFound = &ApiError{Code: "PARTICIPANT_NOT_FOUND", HttpCode: http.StatusNotFound, Message: "participant not found"}
)

// School participant
var (
	ErrSchoolNotFound = &ApiError{Code: "SCHOOL_NOT_FOUND", HttpCode: http.StatusNotFound, Message: "school not found"}
)
