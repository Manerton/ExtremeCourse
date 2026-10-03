package rabbitmq

import (
	"log"
	"strings"

	amqp "github.com/rabbitmq/amqp091-go"
)

func MustConnect(connectionStr string) *amqp.Connection {
	connect, err := amqp.Dial(strings.TrimSpace(connectionStr))
	if err != nil {
		log.Fatalf("Failed connect rabbitmq %s: %v", connectionStr, err)
	}

	return connect
}
