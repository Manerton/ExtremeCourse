package user_service

import (
	"context"
	"log/slog"
	recover_dto "main/internal/dto/auth/recover"
	user_dto "main/internal/dto/user"
	"main/internal/lib/crypt"
	"main/internal/lib/errs"
	"main/internal/lib/liblogger"
	paricipant_mapper "main/internal/lib/mapper/participant_mapper"
	"main/internal/lib/mapper/user_mapper"
	"main/internal/lib/parser"
	"main/internal/models/participant"
	"main/internal/models/user"
	"main/internal/storage/orm"
	"strconv"

	"github.com/google/uuid"
)

type UserRepository interface {
	GetAll(ctx context.Context, orm orm.ORM, offset *int, limit *int) ([]user.User, error)
	GetByFilter(ctx context.Context, orm orm.ORM, user user.User) (user.User, error)
	GetById(ctx context.Context, orm orm.ORM, id uuid.UUID) (user.User, error)
	GetByListId(ctx context.Context, orm orm.ORM, ids []uuid.UUID) ([]user.User, error)

	GetByRole(ctx context.Context, orm orm.ORM, role user.RoleType) ([]user.User, error)

	GetCount(ctx context.Context, orm orm.ORM) (int64, error)

	Update(ctx context.Context, orm orm.ORM, userModel user.User) error
	Delete(ctx context.Context, orm orm.ORM, id uuid.UUID) error
}

type ParticipantRepository interface {
	GetAll(ctx context.Context, orm orm.ORM, offset, limit *int) ([]participant.Participant, error)
	GetByUserId(ctx context.Context, orm orm.ORM, id uuid.UUID) (participant.Participant, error)
	GetByUserIdListWithPreload(ctx context.Context, orm orm.ORM, ids []uuid.UUID) ([]participant.Participant, error)
}

type UserService struct {
	db                    orm.ORM
	log                   *slog.Logger
	userRepository        UserRepository
	participantRepository ParticipantRepository
}

func New(log *slog.Logger, orm orm.ORM, userRepository UserRepository, participantRepository ParticipantRepository) *UserService {
	ulog := log.With(slog.String("owner", "UserService"))

	return &UserService{
		participantRepository: participantRepository,
		userRepository:        userRepository,
		db:                    orm,
		log:                   ulog,
	}
}

func (s *UserService) GetCount(ctx context.Context) (int64, error) {
	const op = "services.UserService.GetCount"

	log := s.log.With(
		slog.String("op", op),
	)

	userCount, err := s.userRepository.GetCount(ctx, s.db)
	if err != nil {
		log.Error("failed get count users", liblogger.Err(err))
		return 0, errs.ErrInternalError.Wrap("failed get count users")
	}

	return userCount, nil
}

func (s *UserService) GetAll(ctx context.Context, page *int, limit *int) ([]user_dto.UserResponseDTO, error) {
	const op = "services.UserService.GetAll"

	log := s.log.With(
		slog.String("op", op),
	)

	offset := new(int)
	if page != nil && limit != nil {
		*offset = (*page - 1) * (*limit)
	}

	usersResult, err := s.userRepository.GetAll(ctx, s.db, offset, limit)
	if err != nil {
		log.Error("failed find users", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed get all users")
	}

	usersDTO := make([]user_dto.UserResponseDTO, 0, len(usersResult))
	for _, userResult := range usersResult {
		usersDTO = append(usersDTO, user_mapper.ToDTO(userResult))
	}

	return usersDTO, nil
}

func (s *UserService) GetByFilter(ctx context.Context, userDTO user_dto.SearchAttributesUserDTO) (user_dto.UserResponseDTO, error) {
	const op = "services.UserService.GetByFilter"

	log := s.log.With(
		slog.String("op", op),
	)

	userModel := user_mapper.FromSearchToModel(userDTO)
	userResult, err := s.userRepository.GetByFilter(ctx, s.db, userModel)
	if s.db.IsNotFound(err) {
		log.Warn("user not found", slog.Any("model", userModel), liblogger.Err(err))
		return user_dto.UserResponseDTO{}, errs.ErrUserNotFound
	}

	if err != nil {
		log.Error("failed get user", liblogger.Err(err))
		return user_dto.UserResponseDTO{}, errs.ErrInternalError.Wrap("failed find user")
	}

	return user_mapper.ToDTO(userResult), nil
}

func (s *UserService) GetById(ctx context.Context, id string) (user_dto.UserResponseDTO, error) {
	const op = "services.UserService.GetById"

	log := s.log.With(
		slog.String("op", op),
	)

	uid, err := uuid.Parse(id)
	if err != nil {
		log.Error("failed to parse id from string to uuid", slog.String("id", id), liblogger.Err(err))
		return user_dto.UserResponseDTO{}, errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	userResult, err := s.userRepository.GetById(ctx, s.db, uid)
	if s.db.IsNotFound(err) {
		log.Warn("user not found", slog.String("id", id), liblogger.Err(err))
		return user_dto.UserResponseDTO{}, errs.ErrUserNotFound
	}

	if err != nil {
		log.Error("failed to get user", liblogger.Err(err))
		return user_dto.UserResponseDTO{}, errs.ErrInternalError.Wrap("failed find user")
	}

	return user_mapper.ToDTO(userResult), nil
}

func (s *UserService) GetUsersByRole(ctx context.Context, userRole string) ([]user_dto.UserResponseDTO, error) {
	const op = "services.UserService.GetUsersByRole"

	log := s.log.With(
		slog.String("op", op),
	)

	role, err := strconv.Atoi(userRole)
	if err != nil {
		log.Error("failed convert user role to int", slog.String("role", userRole), liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed convert user role")
	}

	usersResult, err := s.userRepository.GetByRole(ctx, s.db, user.RoleType(role))
	if err != nil {
		log.Error("failed get users by role", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed get users by role")
	}

	return user_mapper.ToDTOs(usersResult), nil
}

func (s *UserService) GetAllUserParticipantInfo(ctx context.Context) ([]user_dto.UserParticipantResponseDTO, error) {
	const op = "services.UserService.GetAllUserParticipantInfo"

	log := s.log.With(slog.String("op", op))

	participants, err := s.participantRepository.GetAll(ctx, s.db, nil, nil)
	if err != nil {
		log.Error("failed get all particiapnts", liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed get all participants")
	}

	userParticipantDTOs := make([]user_dto.UserParticipantResponseDTO, 0, len(participants))

	for _, p := range participants {
		userResult, err := s.userRepository.GetById(ctx, s.db, p.UserId)
		if s.db.IsNotFound(err) {
			log.Error("user not found for participant", slog.String("participant id", p.ID.String()), liblogger.Err(err))
			continue
		}

		if err != nil {
			log.Error("failed get user for participant", slog.String("participant id", p.ID.String()), liblogger.Err(err))
			continue
		}
		userParticipantDTOs = append(userParticipantDTOs, user_dto.UserParticipantResponseDTO{
			UserResponseDTO:        user_mapper.ToDTO(userResult),
			ParticipantResponseDTO: paricipant_mapper.ToDTO(p),
		})
	}

	return userParticipantDTOs, nil
}

func (s *UserService) GetUserParticipantById(ctx context.Context, id string) (user_dto.UserParticipantResponseDTO, error) {
	const op = "services.UserService.GetUserParticipantById"

	log := s.log.With(
		slog.String("op", op),
	)

	uid, err := uuid.Parse(id)
	if err != nil {
		log.Error("failed to parse id from string to uuid", slog.String("id", id), liblogger.Err(err))
		return user_dto.UserParticipantResponseDTO{}, errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	userResult, err := s.userRepository.GetById(ctx, s.db, uid)
	if s.db.IsNotFound(err) {
		log.Warn("user not found", slog.String("id", id), liblogger.Err(err))
		return user_dto.UserParticipantResponseDTO{}, errs.ErrUserNotFound
	}

	if err != nil {
		log.Error("failed to get user", liblogger.Err(err))
		return user_dto.UserParticipantResponseDTO{}, errs.ErrInternalError.Wrap("failed find user")
	}

	participantResult, err := s.participantRepository.GetByUserId(ctx, s.db, userResult.ID)
	if s.db.IsNotFound(err) {
		log.Error("participant not found", slog.String("user id", userResult.ID.String()), liblogger.Err(err))
		return user_dto.UserParticipantResponseDTO{}, errs.ErrParticipantNotFound
	}

	if err != nil {
		log.Error("failed to get participant", liblogger.Err(err))
		return user_dto.UserParticipantResponseDTO{}, errs.ErrInternalError.Wrap("failed to get participant")
	}

	return user_dto.UserParticipantResponseDTO{
		UserResponseDTO:        user_mapper.ToDTO(userResult),
		ParticipantResponseDTO: paricipant_mapper.ToDTO(participantResult),
	}, nil

}

func (s *UserService) GetUserParticipantByListId(ctx context.Context, ids []string) ([]user_dto.UserParticipantResponseDTO, error) {
	const op = "services.UserService.GetUserParticipantByListId"

	log := s.log.With(slog.String("op", op))

	uids, err := parser.ParseIdsFromStringToUUIDs(ids)
	if err != nil {
		log.Error("failed parse list string-id to uuid", liblogger.Err(err))
		return nil, errs.ErrBadRequest.Wrap("failed parse uuid list")
	}

	participants, err := s.participantRepository.GetByUserIdListWithPreload(ctx, s.db, uids)
	if err != nil {
		log.Error("failed get participants by list id")
	}

	return paricipant_mapper.FromPreloadToUserParticipantModelList(participants), nil

}

func (s *UserService) GetByListId(ctx context.Context, ids []string) ([]user_dto.UserResponseDTO, error) {
	const op = "services.UserService.GetByListId"

	log := s.log.With(
		slog.String("op", op),
	)

	uids, err := parser.ParseIdsFromStringToUUIDs(ids)
	if err != nil {
		log.Error("failed parse list string-id to uuid", liblogger.Err(err))
		return nil, errs.ErrBadRequest.Wrap("failed parse uuid list")
	}

	usersResult, err := s.userRepository.GetByListId(ctx, s.db, uids)
	if err != nil {
		log.Error("failed to get users by list id", slog.Any("ids", ids), liblogger.Err(err))
		return nil, errs.ErrInternalError.Wrap("failed find users by list id")
	}

	usersDTO := make([]user_dto.UserResponseDTO, 0, len(usersResult))
	for _, userResult := range usersResult {
		usersDTO = append(usersDTO, user_mapper.ToDTO(userResult))
	}
	return usersDTO, nil
}

func (s *UserService) ChangePassword(ctx context.Context, id string, changePasswordDTO recover_dto.ChangePasswordDTORequest) error {
	const op = "services.UserService.ChangePassword"

	log := s.log.With(
		slog.String("op", op),
	)

	uid, err := uuid.Parse(id)
	if err != nil {
		log.Error("failed parse id", slog.String("id", id), liblogger.Err(err))
		return errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	userResult, err := s.userRepository.GetById(ctx, s.db, uid)
	if s.db.IsNotFound(err) {
		log.Error("failed user not fount", slog.String("id", id), liblogger.Err(err))
		return errs.ErrAuthFailed.Wrap("user not found")
	}

	if err != nil {
		log.Error("failed to get user by id", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed get user by id")
	}

	// check password hash
	if !crypt.CheckPasswordHash(changePasswordDTO.OldPassword, userResult.PasswordHash) {
		log.Error("uncorrect password")
		return errs.ErrAuthFailed.Wrap("uncorrect password")
	}

	userResult.PasswordHash, err = crypt.HashPassword(changePasswordDTO.NewPassword)
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

func (s *UserService) Update(ctx context.Context, id string, userDto user_dto.UpdateUserRequestDTO) error {
	const op = "services.UserService.Update"

	log := s.log.With(
		slog.String("op", op),
	)

	uid, err := uuid.Parse(id)
	if err != nil {
		log.Error("failed parse id", slog.String("id", id), liblogger.Err(err))
		return errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	userModel := user_mapper.FromUpdateToModel(userDto, uid)
	if userDto.Password != nil {
		userModel.PasswordHash, err = crypt.HashPassword(*userDto.Password)
		if err != nil {
			log.Error("failed hash password", liblogger.Err(err))
			return errs.ErrInternalError.Wrap("failed hash password")
		}
	}

	err = s.userRepository.Update(ctx, s.db, userModel)
	if err != nil {
		log.Error("failed update user", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed update user")
	}

	return nil
}

func (s *UserService) Delete(ctx context.Context, id string) error {
	const op = "services.UserService.Delete"

	log := s.log.With(
		slog.String("op", op),
	)

	uid, err := uuid.Parse(id)
	if err != nil {
		log.Error("failed parse id", slog.String("id", id), liblogger.Err(err))
		return errs.ErrBadRequest.Wrap("failed parse uuid")
	}

	err = s.userRepository.Delete(ctx, s.db, uid)
	if err != nil {
		log.Error("failed delete user", liblogger.Err(err))
		return errs.ErrInternalError.Wrap("failed delete user")
	}

	return nil
}
