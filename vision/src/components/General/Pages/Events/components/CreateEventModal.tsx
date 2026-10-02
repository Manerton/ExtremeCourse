// pages/components/CreateEventModal.tsx

import { useState } from "react";
import {
    Modal,
    Button,
    Form,
    Alert,
    Spinner,
} from "react-bootstrap";

import { axiosCreateEventFromExcel } from "../../../../../requests/EventsRequests";

interface Props {
    show: boolean;
    onHide: () => void;
    token: string;
    onSuccess?: () => void;
}

const CreateEventModal: React.FC<Props> = ({
    show,
    onHide,
    token,
    onSuccess,
}) => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    
    const [file, setFile] = useState<File | null>(null);
    const [year, setYear] = useState<number>(new Date().getFullYear());

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        
        if (!selectedFile) {
            setFile(null);
            return;
        }

        // Проверяем расширение файла
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];
        
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
        
        if (!allowedTypes.includes(selectedFile.type) && 
            !['xlsx', 'xls'].includes(fileExtension || '')) {
            setError('Пожалуйста, выберите файл Excel (.xlsx или .xls)');
            setFile(null);
            return;
        }

        // Проверяем размер файла (например, максимум 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('Файл слишком большой. Максимальный размер: 10MB');
            setFile(null);
            return;
        }

        setError("");
        setFile(selectedFile);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 2000 && value <= 2100) {
            setYear(value);
        }
    };

    const handleSubmit = async () => {
        try {
            setError("");
            setSuccess("");

            // Валидация перед отправкой
            if (!file) {
                setError("Пожалуйста, выберите файл Excel");
                return;
            }

            if (!year) {
                setError("Пожалуйста, укажите год проведения");
                return;
            }

            setLoading(true);

            await axiosCreateEventFromExcel(token, file, year);
            
            setSuccess("События успешно созданы из файла");
            
            // Сбрасываем форму
            setFile(null);
            setYear(new Date().getFullYear());
            
            // Вызываем onSuccess через небольшую задержку
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                }
                onHide();
            }, 1500);
            
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 
                               "Ошибка при создании событий из файла";
            setError(errorMessage);
            console.error("Upload error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError("");
        setSuccess("");
        setFile(null);
        setYear(new Date().getFullYear());
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Создание событий из Excel
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && (
                    <Alert variant="danger" onClose={() => setError("")} dismissible>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert variant="success" onClose={() => setSuccess("")} dismissible>
                        {success}
                    </Alert>
                )}

                <Form>
                    <Form.Group className="mb-4">
                        <Form.Label>
                            <strong>Файл Excel</strong>
                        </Form.Label>
                        <Form.Control
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                        <Form.Text className="text-muted">
                            Поддерживаются форматы: .xlsx, .xls (макс. 10MB)
                        </Form.Text>
                        {file && (
                            <div className="mt-2">
                                <small className="text-success">
                                    ✓ Выбран файл: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                </small>
                            </div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>
                            <strong>Год проведения</strong>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            value={year}
                            onChange={handleYearChange}
                            min={2000}
                            max={2100}
                            placeholder="Например: 2024"
                            disabled={loading}
                        />
                        <Form.Text className="text-muted">
                            Укажите год, для которого создаются события
                        </Form.Text>
                    </Form.Group>

                    {/* Информационный блок */}
                    <div className="bg-light p-3 rounded">
                        <small className="text-muted">
                            <strong>Информация:</strong>
                            <ul className="mb-0 mt-1">
                                <li>Файл должен содержать корректные данные о событиях</li>
                                <li>Все события будут привязаны к указанному году</li>
                                <li>При успешной загрузке вы будете перенаправлены</li>
                            </ul>
                        </small>
                    </div>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={loading}
                >
                    Отмена
                </Button>

                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading || !file || !year}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Загрузка...
                        </>
                    ) : (
                        'Загрузить и создать'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateEventModal;