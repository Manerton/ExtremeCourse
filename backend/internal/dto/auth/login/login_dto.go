package login_dto

type LoginRequestDTO struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResultDTO struct {
	DeviceId         string `json:"device_id"`
	AccessToken      string `json:"access_token"`
	RefreshToken     string `json:"refresh_token"`
	ExpiresInAccess  int64  `json:"expires_in_access"`  // seconds
	ExpiresInRefresh int64  `json:"expires_in_refresh"` // seconds

	// UserID       string `json:"user_id"`
	// Role         string `json:"role"` // participant, admin, organizer, judge
}

type LoginResponseDTO struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
}
