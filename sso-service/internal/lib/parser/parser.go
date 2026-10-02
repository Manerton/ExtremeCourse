package parser

import (
	"fmt"
	"strconv"

	"github.com/google/uuid"
)

func ParsePageLimit(pageStr string, limitStr string) (*int, *int, error) {
	var page *int = nil
	var limit *int = nil

	if pageStr != "" {
		tempPage, err := strconv.Atoi(pageStr)
		if err != nil {
			return nil, nil, fmt.Errorf("failed parse page: %w", err)
		}
		page = &tempPage
	}

	if limitStr != "" {
		tempLimit, err := strconv.Atoi(limitStr)
		if err != nil {
			return nil, nil, fmt.Errorf("failed parse limit: %w", err)
		}
		limit = &tempLimit
	}

	return page, limit, nil
}

func ParseIdsFromStringToUUIDs(ids []string) ([]uuid.UUID, error) {
	uids := make([]uuid.UUID, 0, len(ids))
	for _, id := range ids {
		uid, err := uuid.Parse(id)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", "ParseIdsFromStringToUUIDs", err)
		}
		uids = append(uids, uid)
	}
	return uids, nil
}
