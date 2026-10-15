package excel_service

import (
	"bytes"
	"context"
	"fmt"
	"log/slog"
	"main/internal/dictionary/achievement_dictionary"
	ApplicationDto "main/internal/dto/applications"
	"net/url"
	"strings"

	"github.com/xuri/excelize/v2"
)

type ExcelService struct {
	log *slog.Logger
}

func NewExcelService(log *slog.Logger) *ExcelService {
	return &ExcelService{
		log: log,
	}
}

func (s *ExcelService) generateURLDownload(path string) string {
	cleanPath := strings.TrimSpace(path)
	if cleanPath == "" {
		return ""
	}
	// url.QueryEscape корректно кодирует кириллицу и спецсимволы в query-параметре
	return fmt.Sprintf("https://профильная-смена.школьныйтехнопарк.рф/api/files/download?path=%s", url.QueryEscape(cleanPath))
}

func (s *ExcelService) ExportApplicationsToExcel(ctx context.Context, apps []ApplicationDto.FullApplicationDetailsDTO) (*bytes.Buffer, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheetName := "Заявки"
	defaultSheet := "Sheet1"
	f.SetSheetName(defaultSheet, sheetName)

	// Стиль заголовка
	headerStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold:  true,
			Color: "#FFFFFF",
			Size:  11,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#1F4E78"},
			Pattern: 1,
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
			WrapText:   true,
		},
		Border: []excelize.Border{
			{Type: "top", Style: 1, Color: "#D9D9D9"},
			{Type: "bottom", Style: 1, Color: "#D9D9D9"},
			{Type: "left", Style: 1, Color: "#D9D9D9"},
			{Type: "right", Style: 1, Color: "#D9D9D9"},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create header style: %w", err)
	}

	// Обычный стиль для строк данных
	dataStyle, err := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{
			Vertical: "center",
			WrapText: true,
		},
		Border: []excelize.Border{
			{Type: "top", Style: 1, Color: "#E0E0E0"},
			{Type: "bottom", Style: 1, Color: "#E0E0E0"},
			{Type: "left", Style: 1, Color: "#E0E0E0"},
			{Type: "right", Style: 1, Color: "#E0E0E0"},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create data style: %w", err)
	}

	// Стиль для кликабельной гиперссылки (синий шрифт + подчеркивание)
	linkStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Color:     "#0563C1",
			Underline: "single",
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "top", Style: 1, Color: "#E0E0E0"},
			{Type: "bottom", Style: 1, Color: "#E0E0E0"},
			{Type: "left", Style: 1, Color: "#E0E0E0"},
			{Type: "right", Style: 1, Color: "#E0E0E0"},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create link style: %w", err)
	}

	headers := []string{
		"ID заявки",
		"Статус",
		"Класс участия",
		"ФИО участника",
		"Email",
		"Телефон",
		"Класс уч-ка",
		"Дата рождения",
		"Мероприятие",
		"Предмет",
		"Школа",
		"Район",
		"Портфолио (Балл)",
		"Код достижения",
		"Дата подачи",
		"Портфолио (файл)",
	}

	for colIdx, header := range headers {
		cell, err := excelize.CoordinatesToCellName(colIdx+1, 1)
		if err != nil {
			return nil, err
		}
		if err := f.SetCellValue(sheetName, cell, header); err != nil {
			return nil, err
		}
	}

	lastHeaderCol, _ := excelize.CoordinatesToCellName(len(headers), 1)
	if err := f.SetCellStyle(sheetName, "A1", lastHeaderCol, headerStyle); err != nil {
		return nil, err
	}
	f.SetRowHeight(sheetName, 1, 28)

	for i, app := range apps {
		row := i + 2

		statusStr := getStatusName(app.Status)

		submittedAtStr := ""
		if !app.SubmittedAt.IsZero() {
			submittedAtStr = app.SubmittedAt.Format("02.01.2006 15:04")
		}

		birthDateStr := ""
		if !app.User.BirthDate.IsZero() {
			birthDateStr = app.User.BirthDate.Format("02.01.2006")
		}

		achievementReadable := achievement_dictionary.FormatAchievements(app.Portfolio.CodeAchievement)

		// Формируем текст для отображения в последней колонке
		downloadURL := s.generateURLDownload(app.Portfolio.FilePath)
		displayFileText := "-"
		if downloadURL != "" {
			displayFileText = "Скачать файл"
		}

		rowData := []interface{}{
			app.ID,
			statusStr,
			app.ClassParticipation,
			app.User.FullName,
			app.User.Email,
			app.User.PhoneNumber,
			app.User.Class,
			birthDateStr,
			app.Event.Name,
			app.Event.Subject,
			app.School.FullName,
			app.School.DistrictName,
			app.Portfolio.Score,
			achievementReadable,
			submittedAtStr,
			displayFileText,
		}

		for colIdx, val := range rowData {
			cell, err := excelize.CoordinatesToCellName(colIdx+1, row)
			if err != nil {
				return nil, err
			}
			if err := f.SetCellValue(sheetName, cell, val); err != nil {
				return nil, err
			}
		}

		// Применяем общий стиль ко всей строке
		firstCell, _ := excelize.CoordinatesToCellName(1, row)
		lastCell, _ := excelize.CoordinatesToCellName(len(rowData), row)
		_ = f.SetCellStyle(sheetName, firstCell, lastCell, dataStyle)

		// Для колонки с файлом (колонка 16 = 'P') устанавливаем кликабельную гиперссылку
		if downloadURL != "" {
			linkCell, _ := excelize.CoordinatesToCellName(len(rowData), row)
			if err := f.SetCellHyperLink(sheetName, linkCell, downloadURL, "External"); err == nil {
				_ = f.SetCellStyle(sheetName, linkCell, linkCell, linkStyle)
			}
		}

		f.SetRowHeight(sheetName, row, 24)
	}

	colWidths := map[string]float64{
		"A": 38, // ID
		"B": 16, // Статус
		"C": 14, // Класс участия
		"D": 32, // ФИО
		"E": 26, // Email
		"F": 18, // Телефон
		"G": 12, // Класс уч-ка
		"H": 14, // Дата рождения
		"I": 28, // Мероприятие
		"J": 20, // Предмет
		"K": 35, // Школа
		"L": 22, // Район
		"M": 16, // Балл
		"N": 45, // Код достижения
		"O": 20, // Дата подачи
		"P": 18, // Портфолио (файл)
	}
	for col, width := range colWidths {
		_ = f.SetColWidth(sheetName, col, col, width)
	}

	buf := new(bytes.Buffer)
	if err := f.Write(buf); err != nil {
		return nil, fmt.Errorf("failed to write excel to buffer: %w", err)
	}

	return buf, nil
}

func getStatusName(status int) string {
	switch status {
	case 1:
		return "Одобрено"
	case 2:
		return "На рассмотрении"
	case 3:
		return "Отозвана участником"
	case 4:
		return "Отклонено"
	default:
		return fmt.Sprintf("Статус %d", status)
	}
}
