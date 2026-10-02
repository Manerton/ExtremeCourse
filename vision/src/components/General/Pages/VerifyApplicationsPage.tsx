import React, { useEffect, useState } from "react";
import { Table, Button, Alert, Badge } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { AUTH, APPLICATION } from "../../../config/api";

// Тип короткоживущего токена
interface JwtPayloadShortLived {
    id: string;
    role: number;
    sub?: string;
    type?: number;
}

// Типы для заявок из агрегационного запроса
interface AggregatedApplication {
    id: string;
    olympiadName: string;
    profile: string;
    category: number;
    status: number;
    surname: string;
    firstName: string;
    patronymic: string;
    birthdate: string;
    gender: number;
    classNumber: number;
    citizenship: number;
    disability: number;
    schoolName: string;
}

interface AggregationResponse {
    status: string;
    status_code: number;
    data: {
        status: string;
        status_code: number;
        data: AggregatedApplication[];
    };
}

// Интерфейс для обновления статуса заявки
interface UpdateApplicationDTO {
    status: number;                // 2 = одобрено, 3 = отклонено, 1 = не обработано
    reason?: number;               // 1 по результатам предыдущего года, 2 по результатам текущего
    code?: string;                 // 09_11_25
    profile: string;               // профиль олимпиады
    class_participation: number;   // класс участия (category)
}

// Константы для отображения
const CITIZENSHIP_TEXT: Record<number, string> = {
    1: "Россия",
    2: "Другое"
};

const DISABILITY_TEXT: Record<number, string> = {
    1: "Нет",
    2: "Есть"
};

const STATUS_TEXT: Record<number, string> = {
    1: "Не обработано",
    2: "Одобрено",
    3: "Отклонено"
};

const GENDER_TEXT: Record<number, string> = {
    1: "Мужской",
    2: "Женский"
};

// Функция для запроса агрегированных заявок
export async function axiosGetVerifyApplications(token: string, body: { id: string; role: number }) {
    const res = await axios.post(
        AUTH.verifySchool,
        body,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }
    );
    return res;
}

// Функция для изменения статуса заявки
export async function axiosUpdateApplicationStatus(token: string, applicationId: string, updateData: UpdateApplicationDTO) {
    const res = await axios.put(
        `${APPLICATION.update}/${applicationId}`,
        updateData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }
    );
    return res;
}

// ===== Компонент =====

const VerifyApplicationsPage: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);
    const [claims, setClaims] = useState<JwtPayloadShortLived | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [applications, setApplications] = useState<AggregatedApplication[]>([]);

    useEffect(() => {
        // 1. Получение токена из URL: /page?access_token=xxxx
        const params = new URLSearchParams(window.location.search);
        const t = params.get("access_token");

        if (!t) {
            setError("Токен доступа отсутствует в URL");
            setLoading(false);
            return;
        }

        setToken(t);

        try {
            // 2. Декодирование JWT
            const decoded = jwtDecode<JwtPayloadShortLived>(t);
            setClaims(decoded);
        } catch (e) {
            setError("Не удалось декодировать токен");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token && claims) {
            fetchApplications();
        }
    }, [token, claims]);

    const fetchApplications = async () => {
        if (!token || !claims) return;

        try {
            setLoading(true);
            setError(null);
            // Используем поля из токена
            const response = await axiosGetVerifyApplications(token, {
                id: claims.sub || claims.id || "",
                role: claims.type || claims.role || 0
            });

            const data: AggregationResponse = response.data;

            if (data.status === "success" && data.data.status === "success") {
                setApplications(data.data.data);
            } else {
                setError("Ошибка при получении заявок");
            }
        } catch (err: any) {
            setError(`Ошибка загрузки: ${err.message}`);
            console.error("Ошибка загрузки заявок:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (app: AggregatedApplication, newStatus: number) => {
        if (!token) return;

        setUpdatingStatus(app.id);
        setError(null);
        setSuccessMessage(null);

        try {
            // Подготовка данных для обновления
            const updateData: UpdateApplicationDTO = {
                status: newStatus,
                profile: app.profile || "",
                class_participation: app.category
                // reason и code опциональны, можно не передавать
            };

            // Вызов API для обновления статуса
            await axiosUpdateApplicationStatus(token, app.id, updateData);

            // Локально обновляем статус
            setApplications(prev =>
                prev.map(item =>
                    item.id === app.id ? { ...item, status: newStatus } : item
                )
            );

            // Показываем сообщение об успехе
            setSuccessMessage(`Статус заявки для ${app.surname} ${app.firstName} успешно изменен на "${STATUS_TEXT[newStatus]}"`);

            // Автоматически скрываем сообщение через 3 секунды
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);

        } catch (err: any) {
            console.error("Ошибка при обновлении статуса:", err);
            setError(`Ошибка при обновлении статуса: ${err.response?.data?.message || err.message}`);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const formatBirthdate = (birthdate: string) => {
        try {
            // Парсим дату из формата "2007-11-29 00:00:00 +0000 UTC"
            const datePart = birthdate.split(' ')[0];
            const [year, month, day] = datePart.split('-');
            return `${day}.${month}.${year}`;
        } catch {
            return birthdate;
        }
    };

    const getStatusBadgeVariant = (status: number) => {
        switch (status) {
            case 1: return "warning";
            case 2: return "success";
            case 3: return "danger";
            default: return "secondary";
        }
    };

    const groupedByOlympiad = applications.reduce<Record<string, AggregatedApplication[]>>(
        (acc, app) => {
            if (!acc[app.olympiadName]) {
                acc[app.olympiadName] = [];
            }
            acc[app.olympiadName].push(app);
            return acc;
        },
        {}
    );

    const sortedOlympiads = Object.keys(groupedByOlympiad).sort();




    // ===== UI =====
    return (
        <div className="container py-4">
            <h2 className="mb-4">Подтверждение заявок учащихся</h2>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}

            {!token && !error && (
                <Alert variant="warning">Ожидание токена...</Alert>
            )}

            {claims && (
                <Alert variant="info">
                    <strong>Вы авторизованы как:</strong><br />
                    {claims.type === 0 ? "Представитель муниципалитета" : "Администратор школы"}<br />
                    ID: {claims.id || claims.sub}
                </Alert>
            )}

            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                    <p className="mt-3">Загрузка заявок...</p>
                </div>
            ) : applications.length === 0 ? (
                <Alert variant="warning" className="text-center">
                    Нет заявок для обработки
                </Alert>
            ) : (
                <div className="table-responsive">
                    {sortedOlympiads.map((olympiadName) => {
                        const apps = groupedByOlympiad[olympiadName];

                        return (
                            <div key={olympiadName} className="mb-5">
                                {/* Заголовок предмета */}
                                <h4 className="mb-3">
                                    {olympiadName}
                                    <Badge bg="secondary" className="ms-2">
                                        {apps.length}
                                    </Badge>
                                </h4>

                                <div className="table-responsive">
                                    <Table striped bordered hover className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>№</th>
                                                <th>ФИО ученика</th>
                                                <th>Школа</th>
                                                <th>Класс обучения</th>
                                                <th>Категория</th>
                                                <th>Пол</th>
                                                <th>Дата рождения</th>
                                                <th>Гражданство</th>
                                                <th>ОВЗ</th>
                                                <th>Статус</th>
                                                <th>Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {apps.map((app, index) => (
                                                <tr key={app.id}>
                                                    <td className="fw-bold">{index + 1}</td>
                                                    <td>{app.surname} {app.firstName} {app.patronymic}</td>
                                                    <td>{app.schoolName}</td>
                                                    <td className="text-center">{app.classNumber}</td>
                                                    <td className="text-center">
                                                        <Badge bg="primary">{app.category} класс</Badge>
                                                    </td>
                                                    <td>{GENDER_TEXT[app.gender]}</td>
                                                    <td>{formatBirthdate(app.birthdate)}</td>
                                                    <td>{CITIZENSHIP_TEXT[app.citizenship]}</td>
                                                    <td>{DISABILITY_TEXT[app.disability]}</td>
                                                    <td>
                                                        <Badge bg={getStatusBadgeVariant(app.status)}>
                                                            {STATUS_TEXT[app.status]}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => updateStatus(app, 2)}
                                                                disabled={updatingStatus === app.id || app.status === 2}
                                                            >
                                                                Одобрить
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => updateStatus(app, 3)}
                                                                disabled={updatingStatus === app.id || app.status === 3}
                                                            >
                                                                Отклонить
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        );
                    })}


                    <div className="mt-3 text-muted small">
                        <p><strong>Легенда статусов:</strong></p>
                        <div className="d-flex gap-3">
                            <span><Badge bg="warning" className="me-1">Ж</Badge> Не обработано</span>
                            <span><Badge bg="success" className="me-1">З</Badge> Одобрено</span>
                            <span><Badge bg="danger" className="me-1">К</Badge> Отклонено</span>
                        </div>
                    </div>
                </div>
            )}

            {applications.length > 0 && (
                <div className="mt-4">
                    <p className="text-muted">
                        <small>
                            <strong>Всего заявок:</strong> {applications.length}<br />
                            <strong>Не обработано:</strong> {applications.filter(a => a.status === 1).length}<br />
                            <strong>Одобрено:</strong> {applications.filter(a => a.status === 2).length}<br />
                            <strong>Отклонено:</strong> {applications.filter(a => a.status === 3).length}
                        </small>
                    </p>
                </div>
            )}
        </div>
    );
};

export default VerifyApplicationsPage;