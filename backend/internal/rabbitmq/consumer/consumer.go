package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	register_dto "main/internal/dto/auth/register"
	participant_dto "main/internal/dto/participant"
	rabbit_dto "main/internal/dto/rabbit"
	school_dto "main/internal/dto/school"
	user_dto "main/internal/dto/user"
	"main/internal/lib/liblogger"
	"sync"
	"time"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

// command
const (
	GET    = ""
	CREATE = "create"
	UPDATE = "update"
	DELETE = "delete"
)

// table name
const (
	USER_TABLE        = "user"
	PARTICIPANT_TABLE = "participant"
	SCHOOL_TABLE      = "school"
)

type UserService interface {
	GetByFilter(ctx context.Context, userDTO user_dto.SearchAttributesUserDTO) (user_dto.UserResponseDTO, error)

	Update(ctx context.Context, id string, userDto user_dto.UpdateUserRequestDTO) error
	Delete(ctx context.Context, id string) error
}

type ParticipantService interface {
	Update(ctx context.Context, id string, participantDTO participant_dto.UpdateParticipantRequestDTO) error
}

type AuthService interface {
	RegisterUser(ctx context.Context, registerUser *register_dto.RegisterUserRequestDTO) error
	RegisterParticipant(ctx context.Context, registerRequst *register_dto.RegisterParticipantRequestDTO) error
}

type SchoolService interface {
	Create(ctx context.Context, schoolDTO school_dto.CreateSchoolRequestDTO) (uuid.UUID, error)
	Update(ctx context.Context, id string, schoolDTO school_dto.UpdateSchoolRequestDTO) error
	Delete(ctx context.Context, id string) error
}

type RabbitConsumer struct {
	log                *slog.Logger
	rabbitConnect      *amqp.Connection
	userService        UserService
	participantService ParticipantService
	authService        AuthService
	schoolService      SchoolService

	connectionAddress string
	mutex             sync.Mutex
}

// construct
func New(log *slog.Logger, address string,
	userService UserService, participantService ParticipantService, authService AuthService, schoolService SchoolService) *RabbitConsumer {
	const op = "RabbitMQ consumer"

	clog := log.With(
		slog.String("owner", op),
	)

	return &RabbitConsumer{
		log:                clog,
		userService:        userService,
		participantService: participantService,
		authService:        authService,
		schoolService:      schoolService,
		connectionAddress:  address,
	}
}

func (c *RabbitConsumer) Start(ctx context.Context, queueName string) {
	go func() {
		for {
			select {
			case <-ctx.Done():
				c.log.Info("consumer stopped by context")
				return
			default:
				err := c.ensureConnection()
				if err != nil {
					c.log.Error("failed to connect to RabbitMQ", liblogger.Err(err))
					time.Sleep(5 * time.Second)
					continue
				}

				if err := c.consumeLoop(ctx, queueName); err != nil {
					c.log.Error("consume loop error", liblogger.Err(err))
					time.Sleep(5 * time.Second) // задержка перед переподключением
				}
			}
		}
	}()

}

func (c *RabbitConsumer) ensureConnection() error {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	if c.rabbitConnect != nil && !c.rabbitConnect.IsClosed() {
		return nil // всё ок
	}

	conn, err := amqp.Dial(c.connectionAddress)
	if err != nil {
		return fmt.Errorf("amqp dial failed: %w", err)
	}
	c.rabbitConnect = conn

	c.log.Info("reconnected to RabbitMQ")
	return nil
}

func (c *RabbitConsumer) consumeLoop(ctx context.Context, queueName string) error {
	rabbitChannel, err := c.rabbitConnect.Channel()
	if err != nil {
		c.log.Error("failed create channel for RabbitMQ")
		return err
	}

	// Обработка закрытия канала
	closeErrChan := make(chan *amqp.Error)
	rabbitChannel.NotifyClose(closeErrChan)

	msgs, err := rabbitChannel.Consume(
		queueName,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		c.log.Error("Failed consume queue", slog.String("queue name", queueName), liblogger.Err(err))
		return err
	}

	for {
		select {
		case <-ctx.Done():
			_ = rabbitChannel.Cancel("", false)
			return nil
		case err := <-closeErrChan:
			if err != nil {
				c.log.Error("rabbit channel closed", liblogger.Err(err))
				return fmt.Errorf("channel closed: %w", err)
			}
			return nil
		case msg, ok := <-msgs:
			if !ok {
				return fmt.Errorf("messages channel closed: %v", ok)
			}

			rabbitDTO := rabbit_dto.RabbitDTO{}

			if err := json.Unmarshal(msg.Body, &rabbitDTO); err != nil {
				c.log.Error("invalid message format", liblogger.Err(err))
				msg.Nack(false, false)
				continue
			}

			err = c.handler(ctx, rabbitDTO)
			if err != nil {
				c.log.Error("task failed", liblogger.Err(err))
				msg.Nack(false, false)
				continue
			}

			msg.Ack(false)
		}
	}
}

func (c *RabbitConsumer) handler(ctx context.Context, rabbitDTO rabbit_dto.RabbitDTO) error {
	id := ""
	if rabbitDTO.Method == UPDATE || rabbitDTO.Method == DELETE {
		var ok bool
		id, ok = rabbitDTO.Data.SearchAttributes["id"].(string)
		if !ok {
			c.log.Error("failed id does not exist", slog.String("id", id))
			return fmt.Errorf("failed update: ID does not exist")
		}
		c.log.Debug("id", slog.String("id", id))
	}

	switch rabbitDTO.Method {
	case CREATE:
		err := c.create(ctx, rabbitDTO.Data.Table, rabbitDTO.Data.Attributes)
		if err != nil {
			c.log.Error("failed create", liblogger.Err(err))
			c.log.Debug("dataJSON", slog.Any("data", rabbitDTO.Data.Attributes))
			return fmt.Errorf("failed create data")
		}
		c.log.Debug("success create", rabbitDTO.Data.Table, rabbitDTO.Data.Attributes)
	case UPDATE:
		err := c.update(ctx, rabbitDTO.Data.Table, rabbitDTO.Data.Attributes, id)
		if err != nil {
			c.log.Error("failed update", liblogger.Err(err))
			return fmt.Errorf("failed update data")
		}
		c.log.Debug("success update", rabbitDTO.Data.Table, rabbitDTO.Data.Attributes)
	case DELETE:
		err := c.delete(ctx, rabbitDTO.Data.Table, id)
		if err != nil {
			c.log.Error("failed delete", liblogger.Err(err))
			return fmt.Errorf("failed delete data")
		}
		c.log.Debug("success delete", rabbitDTO.Data.Table, rabbitDTO.Data.Attributes)
	default:
		c.log.Error("unexpected method", slog.String("method", rabbitDTO.Method))
		return fmt.Errorf("unexpected method %s", rabbitDTO.Method)
	}

	return nil
}

// func (c *RabbitConsumer) get(ctx context.Context, tableName string, data map[string]any) ([]byte, error) {
// 	jsonResult := []byte{}
// 	switch tableName {
// 	case USER_TABLE:
// 		userDTO := user_dto.SearchAttributesUserDTO{}
// 		if err := mapstructure.Decode(data, &userDTO); err != nil {
// 			return nil, fmt.Errorf("failed parse from json: %w", err)
// 		}

// 		userResult, err := c.userService.GetByFilter(ctx, userDTO)
// 		if err != nil {
// 			return nil, fmt.Errorf("%w", err)
// 		}

// 		jsonResult, err = json.Marshal(userResult)
// 		if err != nil {
// 			return nil, fmt.Errorf("failed convert data to json: %w", err)
// 		}
// 	case PARTICIPANT_TABLE:
// 		// TODO!! realise another tables
// 	default:
// 		return nil, fmt.Errorf("unexpected table: %s", tableName)
// 	}
// 	return jsonResult, nil
// }

func MapToStructViaJSON(data map[string]any, out any) error {
	bytes, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal map to JSON: %w", err)
	}

	if err := json.Unmarshal(bytes, out); err != nil {
		return fmt.Errorf("failed to unmarshal JSON to struct: %w", err)
	}

	return nil
}

func (c *RabbitConsumer) create(ctx context.Context, tableName string, data map[string]any) error {

	switch tableName {
	case USER_TABLE:
		userDTO := register_dto.RegisterUserRequestDTO{}
		if err := MapToStructViaJSON(data, &userDTO); err != nil {
			return fmt.Errorf("failed parse json: %w", err)
		}
		err := c.authService.RegisterUser(ctx, &userDTO)
		if err != nil {
			return fmt.Errorf("%w", err)
		}
	case PARTICIPANT_TABLE:
		participantDTO := register_dto.RegisterParticipantRequestDTO{}
		if err := MapToStructViaJSON(data, &participantDTO); err != nil {
			return fmt.Errorf("failed parse json: %w", err)
		}

		err := c.authService.RegisterParticipant(ctx, &participantDTO)
		if err != nil {
			return fmt.Errorf("%w", err)
		}
	case SCHOOL_TABLE:
		schoolDTO := school_dto.CreateSchoolRequestDTO{}
		if err := MapToStructViaJSON(data, &schoolDTO); err != nil {
			return fmt.Errorf("failed parse json: %w", err)
		}

		_, err := c.schoolService.Create(ctx, schoolDTO)
		if err != nil {
			return fmt.Errorf("%w", err)
		}
	default:
		return fmt.Errorf("unexpected table: %s", tableName)
	}
	return nil
}

func (c *RabbitConsumer) update(ctx context.Context, tableName string, data map[string]any, id string) error {
	switch tableName {
	case USER_TABLE:
		userDTO := user_dto.UpdateUserRequestDTO{}
		if err := MapToStructViaJSON(data, &userDTO); err != nil {
			return fmt.Errorf("failed parse json: %w", err)
		}

		err := c.userService.Update(ctx, id, userDTO)
		if err != nil {
			return fmt.Errorf("%w", err)
		}
	case PARTICIPANT_TABLE:
		participantDTO := participant_dto.UpdateParticipantRequestDTO{}
		if err := MapToStructViaJSON(data, &participantDTO); err != nil {
			return fmt.Errorf("failed parse json: %w", err)
		}

		err := c.participantService.Update(ctx, id, participantDTO)
		if err != nil {
			return fmt.Errorf("%w", err)
		}
	case SCHOOL_TABLE:
		schoolDTO := school_dto.UpdateSchoolRequestDTO{}
		if err := MapToStructViaJSON(data, &schoolDTO); err != nil {
			return fmt.Errorf("failed parse json: %w", err)
		}

		err := c.schoolService.Update(ctx, id, schoolDTO)
		if err != nil {
			return fmt.Errorf("%w", err)
		}
	default:
		return fmt.Errorf("unexpected table: %s", tableName)
	}
	return nil
}

func (c *RabbitConsumer) delete(ctx context.Context, tableName string, id string) error {
	switch tableName {
	case USER_TABLE:
		err := c.userService.Delete(ctx, id)
		if err != nil {
			return fmt.Errorf("%w", err)
		}
	case SCHOOL_TABLE:
		err := c.schoolService.Delete(ctx, id)
		if err != nil {
			return fmt.Errorf("%w", err)
		}
	default:
		return fmt.Errorf("unexpected table: %s", tableName)
	}
	return nil
}
