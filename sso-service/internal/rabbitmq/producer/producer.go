package producer

import (
	"context"
	"fmt"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func SendToQueue(channel *amqp.Channel, queueName string, data []byte) error {
	queue, err := channel.QueueDeclare(
		queueName,
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("failed declare queue: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = channel.PublishWithContext(
		ctx, "", queue.Name, false, false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        data,
		},
	)

	if err != nil {
		return fmt.Errorf("failed publish message: %w", err)
	}
	return nil
}
