package auth_service

import (
	"context"
	"fmt"
	"log/slog"
	login_dto "main/internal/dto/auth/login"
	recover_dto "main/internal/dto/auth/recover"
	register_dto "main/internal/dto/auth/register"
	"main/internal/lib/crypt"
	"main/internal/lib/errs"
	"main/internal/lib/helpers/notification_client"
	"main/internal/lib/jwttoken"
	"main/internal/lib/liblogger"
	paricipant_mapper "main/internal/lib/mapper/participant_mapper"
	"main/internal/lib/mapper/user_mapper"
	"main/internal/models/participant"
	"main/internal/models/refresh_token"
	"main/internal/models/user"
	"main/internal/storage/orm"
	redisdb "main/internal/storage/redis"
	"time"

	"github.com/google/uuid"
)

type UserRepository interface {
	GetById(ctx context.Context, orm orm.ORM, id uuid.UUID) (user.User, error)
	GetByFilter(ctx context.Context, orm orm.ORM, userModel user.User) (user.User, error)
	GetByEmail(ctx context.Context, orm orm.ORM, email string) (user.User, error)
	Create(ctx context.Context, orm orm.ORM, user user.User) (uuid.UUID, error)
	Update(ctx context.Context, orm orm.ORM, user user.User) error
}

type ParticipantRepository interface {
	Create(ctx context.Context, orm orm.ORM, participant participant.Participant) (uuid.UUID, error)
}

type RefreshRepository interface {
	GetById(ctx context.Context, orm orm.ORM, id uuid.UUID) (refresh_token.RefreshToken, error)
	GetByDeviceId(ctx context.Context, rom orm.ORM, deviceId uuid.UUID) (refresh_token.RefreshToken, error)

	Create(ctx context.Context, orm orm.ORM, refreshToken refresh_token.RefreshToken) (uuid.UUID, error)
	Update(ctx context.Context, orm orm.ORM, conditions *refresh_token.RefreshToken, token refresh_token.RefreshToken) error
	Delete(ctx context.Context, orm orm.ORM, id uuid.UUID) error
}

type AuthService struct {
	log                   *slog.Logger
	jwtManager            *jwttoken.JWTManager
	db                    orm.ORM
	userRepository        UserRepository
	participantRepository ParticipantRepository
	refreshRepository     RefreshRepository

	notifyClient notification_client.NotificationClient
}

func New(log *slog.Logger, orm orm.ORM, jwtManager *jwttoken.JWTManager,
	userRepository UserRepository, participantRepository ParticipantRepository, refreshRepository RefreshRepository,
	notifyClien notification_client.NotificationClient) *AuthService {

	alog := log.With("owner", "AuthService")

	return &AuthService{
		log:                   alog,
		db:                    orm,
		jwtManager:            jwtManager,
		userRepository:        userRepository,
		participantRepository: participantRepository,
		refreshRepository:     refreshRepository,
		notifyClient:          notifyClien,
	}
}

func (s *AuthService) CheckPhone(ctx context.Context, phone string) (bool, error) {
	const op = "services.AuthService.CheckPhone"

	log := s.log.With(
		slog.String("op", op),
	)

	_, err := s.userRepository.GetByFilter(ctx, s.db, user.User{PhoneNumber: phone})
	if err == nil {
		log.Warn("failed user exist", slog.String("phone", phone))
		return false, nil
	}

	if !s.db.IsNotFound(err) {
		log.Error("failed to check user exist", liblogger.Err(err))
		return false, errs.ErrInternalError.Wrap("failed to check user exist")
	}

	return true, nil
}

func (s *AuthService) CheckEmail(ctx context.Context, email string) (bool, error) {
	const op = "services.AuthService.CheckEmail"

	log := s.log.With(
		slog.String("op", op),
	)

	_, err := s.userRepository.GetByFilter(ctx, s.db, user.User{Email: email})
	if err == nil {
		log.Warn("failed user exist", slog.String("email", email))
		return false, nil
	}

	if !s.db.IsNotFound(err) {
		log.Error("failed to check user exist", liblogger.Err(err))
		return false, errs.ErrInternalError.Wrap("failed to check user exist")
	}

	return true, nil
}

func (s *AuthService) Login(ctx context.Context, loginRequest *login_dto.LoginRequestDTO, deviceId string, deviceName string) (*login_dto.AuthResultDTO, error) {
	const op = "services.AuthService.Login"

	log := s.log.With(
		slog.String("op", op),
	)

	userResult, err := s.userRepository.GetByEmail(ctx, s.db, loginRequest.Email)
	if s.db.IsNotFound(err) {
		log.Error("failed user not fount", slog.String("email", loginRequest.Email), liblogger.Err(err))
		return nil, errs.ErrAuthFailed.Wrap("email not found")
	}

	if err != nil {
		log.Error("failed to get user by email", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed get user by email")
	}

	// check password hash
	if !crypt.CheckPasswordHash(loginRequest.Password, userResult.PasswordHash) {
		log.Error("uncorrect password")
		return nil, errs.ErrAuthFailed.Wrap("uncorrect password")
	}

	// create access token
	token, err := s.jwtManager.CreateToken(userResult)
	if err != nil {
		log.Error("failed when create token", liblogger.Err(err))
		return nil, errs.ErrAccessToken
	}

	var refreshToken string
	var deviceUid uuid.UUID
	var oldRefreshTokenId uuid.UUID
	if deviceId != "" {
		// update refresh token
		deviceUid, err = uuid.Parse(deviceId)
		if err != nil {
			log.Error("failed parse uid", slog.String("uid", deviceId), liblogger.Err(err))
			return nil, errs.ErrBadRequest.Wrap("invalid device uuid")
		}

		oldRefreshToken, err := s.refreshRepository.GetByDeviceId(ctx, s.db, deviceUid)
		if err != nil {
			if !s.db.IsNotFound(err) {
				log.Error("failed get refresh token by device id", slog.String("device id", deviceId), liblogger.Err(err))
				return nil, errs.ErrInternalError.Wrap("failed get refresh token")
			}
		}
		oldRefreshTokenId = oldRefreshToken.ID
	}

	if oldRefreshTokenId != uuid.Nil {
		refreshToken, err = s.updateRefreshToken(ctx, oldRefreshTokenId, userResult)
		if err != nil {
			log.Error("failed update refresh token", slog.String("token id", oldRefreshTokenId.String()), liblogger.Err(err))
			return nil, errs.ErrRefreshToken.Wrap("failed update refresh token")
		}
	} else {
		// first login with this device
		deviceUid = uuid.New()
		// create refresh token
		refreshToken, err = s.preparationRefreshToken(ctx, userResult, deviceUid, deviceName)
		if err != nil {
			log.Error("failed when create refresh token", liblogger.Err(err))
			return nil, errs.ErrRefreshToken
		}
	}

	return &login_dto.AuthResultDTO{
		DeviceId:         deviceUid.String(),
		AccessToken:      token,
		RefreshToken:     refreshToken,
		ExpiresInAccess:  int64(s.jwtManager.GetAccessDuration().Seconds()),
		ExpiresInRefresh: int64(s.jwtManager.GetRefreshDuration().Seconds()),
	}, err
}

func (s *AuthService) Logout(ctx context.Context, tokenStr string) error {
	const op = "services.AuthService.Logout"

	log := s.log.With(
		slog.String("op", op),
	)

	token, err := s.jwtManager.ParseRefreshTokenWithClaims(tokenStr)
	if err != nil {
		log.Error("failed parse refresh token", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed parse refresh token")
	}

	uid, err := uuid.Parse(token.ID)
	if err != nil {
		log.Error("failed parse id to uuid", liblogger.Err(err))
		return errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	err = s.refreshRepository.Delete(ctx, s.db, uid)
	if err != nil {
		log.Error("failed delete refresh token", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed delete refresh token")
	}

	return nil
}

func (s *AuthService) preparationRefreshToken(ctx context.Context, userResult user.User, deviceId uuid.UUID, deviceName string) (string, error) {
	tokenId := uuid.New()
	// create refresh token
	refreshToken, err := s.jwtManager.CreateRefreshToken(userResult, tokenId.String())
	if err != nil {
		return "", fmt.Errorf("failed when create refresh token: %w", err)
	}

	// hash token
	refreshTokenModel := refresh_token.RefreshToken{
		ID:         tokenId,
		UserID:     userResult.ID,
		Token:      refreshToken,
		Status:     refresh_token.Active,
		DeviceId:   deviceId,
		DeviceName: deviceName,
		ExpiresAt:  time.Now().Add(s.jwtManager.GetRefreshDuration()),
	}

	// save refresh token
	_, err = s.refreshRepository.Create(ctx, s.db, refreshTokenModel)
	if err != nil {
		return "", fmt.Errorf("failed save refresh token: %w", err)
	}

	return refreshToken, nil
}

func (s AuthService) updateRefreshToken(ctx context.Context, updateId uuid.UUID, user user.User) (string, error) {
	// create refresh token
	refreshToken, err := s.jwtManager.CreateRefreshToken(user, updateId.String())
	if err != nil {
		return "", fmt.Errorf("failed when create refresh token: %w", err)
	}

	refreshTokenModel := refresh_token.RefreshToken{
		Status:    refresh_token.Active,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(s.jwtManager.GetRefreshDuration()),
	}

	err = s.refreshRepository.Update(ctx, s.db, &refresh_token.RefreshToken{ID: updateId}, refreshTokenModel)
	if err != nil {
		return "", fmt.Errorf("failed update refresh token")
	}

	return refreshToken, nil
}

func (s *AuthService) RegisterUser(ctx context.Context, registerUser *register_dto.RegisterUserRequestDTO) error {
	const op = "services.AuthService.RegisterUser"

	log := s.log.With(
		slog.String("op", op),
	)

	_, err := s.userRepository.GetByEmail(ctx, s.db, registerUser.Email)
	if err == nil {
		log.Warn("failed user exist", slog.String("email", registerUser.Email))
		return errs.ErrUserAlreadyExists
	}

	if !s.db.IsNotFound(err) {
		log.Error("failed to check user exist", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed get user by email")
	}

	userModel := user_mapper.FromRegisterUserToModel(registerUser)
	userModel.PasswordHash, err = crypt.HashPassword(registerUser.Password)
	if err != nil {
		log.Error("failed to hash password", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed hash password")
	}

	_, err = s.userRepository.Create(ctx, s.db, userModel)
	if err != nil {
		log.Error("failed to create user", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed create user")
	}

	return nil
}

func (s *AuthService) RegisterParticipant(ctx context.Context, registerRequst *register_dto.RegisterParticipantRequestDTO) error {
	const op = "services.AuthService.RegisterParticipant"

	log := s.log.With(
		slog.String("op", op),
	)

	_, err := s.userRepository.GetByEmail(ctx, s.db, registerRequst.Email)
	if err == nil {
		log.Warn("failed user exist", slog.String("email", registerRequst.Email))
		return errs.ErrUserAlreadyExists
	}

	if !s.db.IsNotFound(err) {
		log.Error("failed to check user exist", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to check user exist")
	}

	userModel := user_mapper.FromRegisterToModel(registerRequst)
	transaction, err := s.db.TransactionBegin()
	if err != nil {
		log.Error("failed to begin transaction", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to begin transaction")
	}

	userModel.PasswordHash, err = crypt.HashPassword(registerRequst.Password)
	if err != nil {
		log.Error("failed to hash password", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to hash password")
	}

	userId, err := s.userRepository.Create(ctx, transaction, userModel)
	if err != nil {
		transaction.TransactionRollback()
		log.Error("failed to create user", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to create user")
	}

	participantModel := paricipant_mapper.FromRegisterToModel(registerRequst, userId)
	_, err = s.participantRepository.Create(ctx, transaction, participantModel)
	if err != nil {
		transaction.TransactionRollback()
		log.Error("failed to create participant", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to create participant")
	}

	transaction.TransactionCommit()

	// err = s.notifyClient.SendNotifyAcceptAccount(userModel.Email)
	// if err != nil {
	// 	log.Error("failed send notify on email: %w", liblogger.Err(err))
	// 	return errs.ErrInternalError.Wrap("failed to send notify on email")
	// }

	return nil
}

func (s *AuthService) RecoveryPassword(ctx context.Context, recoverDTO recover_dto.ForgotPasswordDTORequest) error {
	const op = "service.AuthService.RecoveryPassword"

	log := s.log.With(
		slog.String("op", op),
	)

	trustCode, err := redisdb.GetActivationCode(recoverDTO.Email)
	if err != nil {
		log.Error("failed get trust code", liblogger.Err(err), slog.String("email", recoverDTO.Email))
		return errs.ErrActivationCodeNotFound
	}

	if trustCode != recoverDTO.Code {
		log.Error("user code incorrent", slog.String("user code", recoverDTO.Code), slog.String("trust code", trustCode))
		return errs.ErrInvalidActivationCode
	}

	userResult, err := s.userRepository.GetByEmail(ctx, s.db, recoverDTO.Email)
	if s.db.IsNotFound(err) {
		log.Error("failed user not fount", slog.String("email", recoverDTO.Email), liblogger.Err(err))
		return errs.ErrAuthFailed.Wrap("email not found")
	}

	if err != nil {
		log.Error("failed to get user by email", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed get user by email")
	}

	userResult.PasswordHash, err = crypt.HashPassword(recoverDTO.Password)
	if err != nil {
		log.Error("failed to hash password", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to hash password")
	}

	err = s.userRepository.Update(ctx, s.db, userResult)
	if err != nil {
		log.Error("failed update user of new password", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed update user password")
	}

	return nil
}

func (s *AuthService) ActivateAccount(ctx context.Context, email string, userCode string) error {
	const op = "services.AuthService.ActivateAccount"

	log := s.log.With(
		slog.String("op", op),
	)

	trustCode, err := redisdb.GetActivationCode(email)
	if err != nil {
		log.Error("failed get trust code", liblogger.Err(err), slog.String("email", email))
		return errs.ErrActivationCodeNotFound
	}

	if trustCode != userCode {
		log.Error("user code incorrent", slog.String("user code", userCode), slog.String("trust code", trustCode))
		return errs.ErrInvalidActivationCode
	}

	userModel, err := s.userRepository.GetByEmail(ctx, s.db, email)
	if s.db.IsNotFound(err) {
		log.Error("failed user not found", liblogger.Err(err), slog.String("email", email))
		return errs.ErrUserNotFound
	}

	if err != nil {
		log.Error("failed to find user by email", email, liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed to find user by email")
	}

	// activate account
	userModel.Activated = true
	err = s.userRepository.Update(ctx, s.db, userModel)
	if err != nil {
		log.Error("failed update user activate status", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed update user activate status")
	}

	return nil
}

func (s *AuthService) VerifyTrustCode(ctx context.Context, verifyCode register_dto.VerifyCodeDTO) error {
	const op = "services.AuthService.VerifyTrustCode"

	log := s.log.With(slog.String("op", op))

	correctCode, err := redisdb.GetActivationCode(verifyCode.PhoneNumber)
	if err != nil {
		log.Error("failed get trust code by phone", slog.String("phone", verifyCode.PhoneNumber), liblogger.Err(err))
		return errs.ErrBadRequest
	}

	if correctCode != verifyCode.Code {
		log.Warn("invalid user code", slog.String("user-code", verifyCode.Code), slog.String("correct-code", correctCode))
		return errs.ErrBadRequest
	}

	return nil
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*login_dto.AuthResultDTO, error) {
	const op = "services.AuthService.Refresh"

	log := s.log.With(
		slog.String("op", op),
	)

	// check and get claims
	tokenClaims, err := s.jwtManager.ParseRefreshTokenWithClaims(refreshToken)
	if err != nil {
		log.Error("failed get refresh token claims", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed get claims from refresh token")
	}

	tokenUid, err := uuid.Parse(tokenClaims.ID)
	if err != nil {
		log.Error("failed parse id to uuid", slog.String("id", tokenClaims.ID), liblogger.Err(err))
		return nil, errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	// get token from db
	tokenDB, err := s.refreshRepository.GetById(ctx, s.db, tokenUid)
	if s.db.IsNotFound(err) {
		log.Error("refresh token does not exist on db", slog.String("id", tokenClaims.ID), liblogger.Err(err))
		return nil, errs.ErrTokenNotFound.Wrap("refresh token not found")
	}

	if err != nil {
		log.Error("failed get refresh token", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed get refresh token")
	}

	// check token is revoked
	if tokenDB.Status == refresh_token.Revoke {
		log.Error("Token was be revoked")
		return nil, errs.ErrRevokedToken
	}

	// parse user id to uuid
	userUid, err := uuid.Parse(tokenClaims.Subject)
	if err != nil {
		log.Error("failed parse user id from token to uuid", slog.String("user id", tokenClaims.Subject), liblogger.Err(err))
		return nil, errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	// find user
	userFind, err := s.userRepository.GetById(ctx, s.db, userUid)
	if s.db.IsNotFound(err) {
		log.Warn("user not found", liblogger.Err(err))
		return nil, errs.ErrUserNotFound
	}
	if err != nil {
		log.Error("failed get user", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed get user")
	}

	// create token
	token, err := s.jwtManager.CreateToken(userFind)
	if err != nil {
		log.Error("failed when create token", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed create token")
	}

	// create refresh token
	newRefreshToken, err := s.updateRefreshToken(ctx, tokenDB.ID, userFind)
	if err != nil {
		log.Error("failed when create refresh token", liblogger.Err(err))
		return nil, errs.ErrRefreshToken
	}

	return &login_dto.AuthResultDTO{
		AccessToken:      token,
		RefreshToken:     newRefreshToken,
		ExpiresInAccess:  int64(s.jwtManager.GetAccessDuration().Seconds()),
		ExpiresInRefresh: int64(s.jwtManager.GetRefreshDuration().Seconds()),
	}, err
}

func (s *AuthService) RevokeToken(ctx context.Context, id string) error {
	const op = "services.AuthService.RevokeToken"

	log := s.log.With(
		slog.String("op", op),
	)

	uid, err := uuid.Parse(id)
	if err != nil {
		log.Error("failed parse id to uuid", slog.String("id", id), liblogger.Err(err))
		return errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	updates := refresh_token.RefreshToken{
		ID: uid,
	}

	err = s.refreshRepository.Update(ctx, s.db, &updates, refresh_token.RefreshToken{Status: refresh_token.Revoke})
	if err != nil {
		log.Error("failed update refresh token", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed revoke refresh token")
	}

	return nil
}

func (s *AuthService) RevokeAllUserTokens(ctx context.Context, userId string) error {
	const op = "services.AuthService.RevokeAllUserTokens"

	log := s.log.With(
		slog.String("op", op),
	)

	uid, err := uuid.Parse(userId)
	if err != nil {
		log.Error("failed parse user ID to uuid", slog.String("user id", userId), liblogger.Err(err))
		return errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	updates := refresh_token.RefreshToken{
		Status: refresh_token.Revoke,
	}

	conditions := refresh_token.RefreshToken{UserID: uid}

	err = s.refreshRepository.Update(ctx, s.db, &conditions, updates)
	if err != nil {
		log.Error("failed updates all user tokens", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed revoke all user refresh tokens")
	}

	return nil
}
