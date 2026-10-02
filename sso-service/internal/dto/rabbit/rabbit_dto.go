package rabbit_dto

import (
	"encoding/json"
	"fmt"
)

type RabbitDTO struct {
	AppName string     `json:"appName"`
	Method  string     `json:"method"`
	Data    RabbitData `json:"data"`
}

type RabbitData struct {
	Table            string         `json:"table"`
	Attributes       map[string]any `json:"attributes"`
	SearchAttributes map[string]any `json:"searchAttributes"`
}

func (rd *RabbitData) UnmarshalJSON(data []byte) error {
	// Временная структура для парсинга
	type Alias RabbitData
	aux := &struct {
		Attributes       interface{} `json:"attributes"`
		SearchAttributes interface{} `json:"searchAttributes"`
		*Alias
	}{
		Alias: (*Alias)(rd),
	}

	if err := json.Unmarshal(data, aux); err != nil {
		return err
	}

	// Обработка Attributes
	rd.Attributes = make(map[string]any)
	if aux.Attributes != nil {
		switch v := aux.Attributes.(type) {
		case map[string]any:
			rd.Attributes = v
		case []any: // Обработка случая с пустым массивом []
			if len(v) > 0 {
				return fmt.Errorf("attributes must be an object or empty array")
			}
		default:
			return fmt.Errorf("invalid type for attributes: %T", v)
		}
	}

	// Обработка SearchAttributes (аналогично)
	rd.SearchAttributes = make(map[string]any)
	if aux.SearchAttributes != nil {
		switch v := aux.SearchAttributes.(type) {
		case map[string]any:
			rd.SearchAttributes = v
		case []any:
			if len(v) > 0 {
				return fmt.Errorf("searchAttributes must be an object or empty array")
			}
		default:
			return fmt.Errorf("invalid type for searchAttributes: %T", v)
		}
	}

	return nil
}
