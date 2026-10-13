package file_handler

import (
	"fmt"
	"main/internal/lib/errs"
	"main/internal/lib/response"
	"main/internal/storage/filestore"
	"mime"
	"net/http"
	"net/url"
	"path/filepath"
	"strings"

	"github.com/go-chi/render"
)

type FileHandler struct {
	storage *filestore.DiskStorage
}

func NewFileHandler(storage *filestore.DiskStorage) *FileHandler {
	return &FileHandler{storage: storage}
}

// DownloadFile скачивает файл по пути
// @Summary      Скачивание файла
// @Description  Скачивает файл из файлового хранилища по переданному относительному или полному пути
// @Tags         files
// @Produce      application/octet-stream
// @Param        path query string true "Путь к файлу или имя файла" example("uploads/550e8400-e29b-41d4-a716-446655440000-diploma.pdf")
// @Success      200 {file} binary "Файл успешно получен"
// @Failure      400 {object} response.ApiResponse "Не указан путь к файлу"
// @Failure      403 {object} response.ApiResponse "Доступ запрещен (попытка Path Traversal)"
// @Failure      404 {object} response.ApiResponse "Файл не найден"
// @Failure      500 {object} response.ApiResponse "Внутренняя ошибка сервера"
// @Router       /api/files/download [get]
func (h *FileHandler) DownloadFile(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Query().Get("path")
	if filePath == "" {
		http.Error(w, "missing file path", http.StatusBadRequest)
		return
	}

	newFilePath, err := url.PathUnescape(filePath)
	if err != nil {
		newFilePath = filePath
	}

	// Открываем файл через хранилище
	file, fileInfo, originalName, err := h.storage.GetFile(newFilePath)
	if err != nil {
		if apiErr, ok := errs.IsApiError(err); ok {
			render.Status(r, apiErr.HttpCode)
			render.JSON(w, r, response.ErrorApiResponse(apiErr))
			return
		}
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response.ErrorApiResponse(errs.ErrInternalError))
		return
	}
	defer file.Close()

	// 1. Определяем Content-Type по расширению
	ext := strings.ToLower(filepath.Ext(originalName))
	contentType := mime.TypeByExtension(ext)
	if contentType == "" {
		switch ext {
		case ".pdf":
			contentType = "application/pdf"
		case ".pptx":
			contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
		case ".ppt":
			contentType = "application/vnd.ms-powerpoint"
		default:
			contentType = "application/octet-stream"
		}
	}
	w.Header().Set("Content-Type", contentType)

	// 2. Выбираем режим: inline (для предпросмотра) или attachment (для принудительного скачивания)
	dispositionType := "attachment"
	if r.URL.Query().Get("inline") == "true" || r.URL.Query().Get("view") == "true" {
		dispositionType = "inline"
	}

	// 3. Формируем корректный заголовок с поддержкой UTF-8
	encodedName := url.PathEscape(originalName)
	w.Header().Set("Content-Disposition", fmt.Sprintf("%s; filename*=UTF-8''%s", dispositionType, encodedName))

	// 4. Отдаем файл клиенту
	http.ServeContent(w, r, originalName, fileInfo.ModTime(), file)
}
