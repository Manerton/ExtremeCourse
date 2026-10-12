package file_handler

import (
	"fmt"
	"main/internal/lib/errs"
	"main/internal/lib/response"
	"main/internal/storage/filestore"
	"net/http"
	"net/url"

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

	// Открываем файл через хранилище
	file, fileInfo, originalName, err := h.storage.GetFile(filePath)
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

	// Заголовок для принудительного скачивания с сохранением исходного имени файла
	// url.PathEscape нужен для корректной поддержки кириллицы в именах файлов
	encodedName := url.PathEscape(originalName)
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename*=UTF-8''%s", encodedName))

	// Отдаем файл с поддержкой Range-запросов и стриминга
	http.ServeContent(w, r, originalName, fileInfo.ModTime(), file)
}
