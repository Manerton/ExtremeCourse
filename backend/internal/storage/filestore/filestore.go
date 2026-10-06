package filestore

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

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

	ext := filepath.Ext(filename)
	uniqueName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	targetPath := filepath.Join(s.baseDir, uniqueName)

	dst, err := os.Create(targetPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return "", err
	}

	return targetPath, nil
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
