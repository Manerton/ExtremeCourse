package filestore

import (
	"fmt"
	"io"
	"main/internal/lib/errs"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

type DiskStorage struct {
	baseDir string
}

func NewDiskStorage(baseDir string) *DiskStorage {
	_ = os.MkdirAll(baseDir, 0755)
	return &DiskStorage{baseDir: baseDir}
}

// Save сохраняет файл с уникальным префиксом имени и возвращает относительный путь
func (s *DiskStorage) Save(filename string, src io.Reader) (string, error) {
	if err := os.MkdirAll(s.baseDir, 0755); err != nil {
		return "", err
	}

	uniqueName := fmt.Sprintf("%s-%s", uuid.New().String(), filename)
	targetPath := filepath.Join(s.baseDir, uniqueName)

	dst, err := os.Create(targetPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return "", err
	}

	return uniqueName, nil
}

// GetFile открывает файл по переданному пути или относительному имени файла.
// Возвращает *os.File (вызывающий обязан закрыть его: defer file.Close()),
// очищенное оригинальное имя файла и ошибку.
func (s *DiskStorage) GetFile(filePath string) (*os.File, os.FileInfo, string, error) {
	if strings.TrimSpace(filePath) == "" {
		return nil, nil, "", errs.ErrFileNotFound
	}

	// Если путь относительный — резолвим его относительно baseDir
	var targetPath string
	if filepath.IsAbs(filePath) {
		targetPath = filepath.Clean(filePath)
	} else {
		targetPath = filepath.Join(s.baseDir, filepath.Clean(filePath))
	}

	// ЗАЩИТА ОТ DIRECTORY TRAVERSAL:
	// Проверяем, что итоговый путь строго находится внутри baseDir
	rel, err := filepath.Rel(s.baseDir, targetPath)
	if err != nil || strings.HasPrefix(rel, "..") || rel == "." {
		return nil, nil, "", errs.ErrAccessDenied
	}

	info, err := os.Stat(targetPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil, "", errs.ErrFileNotFound
		}
		return nil, nil, "", fmt.Errorf("failed to stat file: %w", err)
	}

	if info.IsDir() {
		return nil, nil, "", errs.ErrFileNotFound
	}

	file, err := os.Open(targetPath)
	if err != nil {
		return nil, nil, "", fmt.Errorf("failed to open file: %w", err)
	}

	// Восстанавливаем оригинальное имя файла, убирая UUID-префикс вида "<uuid>-"
	cleanFileName := extractOriginalFilename(filepath.Base(targetPath))

	return file, info, cleanFileName, nil
}
func extractOriginalFilename(filename string) string {
	// Длина UUID в строковом виде = 36 символов + 1 символ тире = 37
	if len(filename) > 37 && filename[36] == '-' {
		if _, err := uuid.Parse(filename[:36]); err == nil {
			return filename[37:]
		}
	}
	return filename
}

// Delete удаляет файл с диска
func (s *DiskStorage) Delete(filePath string) error {
	if filePath == "" {
		return nil
	}
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}
