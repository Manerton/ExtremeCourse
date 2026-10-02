package recover_dto

type ForgotPasswordDTORequest struct {
	Email    string `json:"mail"`
	Code     string `json:"code"`
	Password string `json:"password"`
}

type ChangePasswordDTORequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}
