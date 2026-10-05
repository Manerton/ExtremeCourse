package event

import "github.com/google/uuid"

const (
	EventStatusClosed = 1
	EventStatusOpen   = 2
)

type Event struct {
	ID      uuid.UUID
	Name    string
	Subject string
	Class   int
	Status  int
}
