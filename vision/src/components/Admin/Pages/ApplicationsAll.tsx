import React, { useEffect, useState, useRef } from "react";
import { Table, Alert, Badge, Button } from "react-bootstrap";
import axios from "axios";
import { API_CONFIG } from "../../../config/api";
import { useAuth } from "../../Helpers/AuthContext";

// ===== Константы отображения =====
const CITIZENSHIP_TEXT: Record<number, string> = { 1: "Россия", 2: "Другое" };
const DISABILITY_TEXT: Record<number, string> = { 1: "Нет", 2: "Есть" };
const STATUS_TEXT: Record<number, string> = { 
  1: "Не обработано", 
  2: "Одобрено", 
  3: "Отклонено" 
};
const GENDER_TEXT: Record<number, string> = { 1: "М", 2: "Ж" };

// ===== Типы =====
interface AggregatedApplicationResponse {
    id: string;
    firstname: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    birthdate: string;
    gender: number;
    classNumber: number;
    citizenship: number;
    disability: number;
    schoolName: string;
    districtName: string;
    olympiadName: string;
    profile?: string | null;
    category: number;
    status: number;
    code: string;
    submittedAt: string;
}

interface ApiResponse<T> {
    status: string;
    status_code: number;
    data: T;
    error?: string;
}

// Вспомогательный тип для отображения
interface DisplayApplication {
    id: string;
    firstname: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    birthdate: string;
    gender: string;
    classNumber: number;
    citizenship: string;
    disability: string;
    schoolName: string;
    districtName: string;
    olympiadName: string;
    profile?: string | null;
    category: number;
    status: number;
    statusText: string;
    code: string;
    submittedAt: string;
}

// ===== API helper =====
async function axiosGetAllAggregatedApplications(token: string): Promise<AggregatedApplicationResponse[]> {
    console.log("Making API call to:", API_CONFIG.ALLAPPLICATIONS);
    
    try {
        const res = await axios.get(
            API_CONFIG.ALLAPPLICATIONS,
            {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                withCredentials: true,
                timeout: 30000,
            }
        );
        
        console.log("Response structure:", {
            status: res.data.status,
            status_code: res.data.status_code,
            dataType: typeof res.data.data,
            isArray: Array.isArray(res.data.data)
        });
        
        // Проверяем структуру ответа
        if (res.data.status_code !== 200) {
            throw new Error(res.data.error || `Ошибка ${res.data.status_code} при получении данных`);
        }
        
        // Вариант 1: Если данные находятся в data.data (двойная вложенность)
        if (res.data.data && typeof res.data.data === 'object' && res.data.data.data) {
            console.log("Found nested data structure: data.data.data");
            const nestedData = res.data.data.data;
            
            if (Array.isArray(nestedData)) {
                console.log("Nested data is array, length:", nestedData.length);
                return nestedData;
            } else {
                console.log("Nested data is not array:", typeof nestedData);
                return [];
            }
        }
        
        // Вариант 2: Если данные находятся прямо в data
        if (Array.isArray(res.data.data)) {
            console.log("Data is array, length:", res.data.data.length);
            return res.data.data;
        }
        
        // Вариант 3: Если это объект с полем data
        if (res.data.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }
        
        console.warn("Unexpected response format:", res.data);
        return [];
        
    } catch (error: any) {
        console.error("API Error details:", error);
        
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        
        if (error.code === 'ECONNABORTED') {
            throw new Error("Таймаут запроса. Сервер не отвечает.");
        }
        
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        
        if (error.message) {
            throw new Error(error.message);
        }
        
        throw new Error("Не удалось загрузить данные.");
    }
}

// ===== Вспомогательные функции =====
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    } catch {
        return dateString;
    }
};

const getStatusBadgeVariant = (status: number): string => {
    switch(status) {
        case 1: return "warning";
        case 2: return "success";
        case 3: return "danger";
        default: return "secondary";
    }
};

const transformDataForDisplay = (data: AggregatedApplicationResponse[]): DisplayApplication[] => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
        ...item,
        gender: GENDER_TEXT[item.gender] || `Неизвестно (${item.gender})`,
        citizenship: CITIZENSHIP_TEXT[item.citizenship] || `Неизвестно (${item.citizenship})`,
        disability: DISABILITY_TEXT[item.disability] || `Неизвестно (${item.disability})`,
        statusText: STATUS_TEXT[item.status] || `Неизвестно (${item.status})`,
        birthdate: formatDate(item.birthdate),
        submittedAt: formatDate(item.submittedAt)
    }));
};

// ===== Компонент =====
const ApplicationsPage: React.FC = () => {
    const { accessToken } = useAuth();
    const [rawData, setRawData] = useState<AggregatedApplicationResponse[]>([]);
    const [displayData, setDisplayData] = useState<DisplayApplication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    // Refs для защиты от множественных вызовов
    const isFetchingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Сбрасываем состояние при изменении токена
        if (!accessToken) {
            setRawData([]);
            setDisplayData([]);
            setError("Отсутствует токен авторизации");
            setLoading(false);
            return;
        }

        // Загружаем данные только при начальной загрузке
        if (isInitialLoad) {
            fetchData();
        }
    }, [accessToken]);

    const fetchData = async () => {
        // Защита от множественных одновременных запросов
        if (isFetchingRef.current) {
            console.log("Запрос уже выполняется, пропускаем...");
            return;
        }

        if (!accessToken) {
            setError("Отсутствует токен авторизации");
            return;
        }

        try {
            // Отменяем предыдущий запрос если он есть
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Создаем новый AbortController
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            
            isFetchingRef.current = true;
            setLoading(true);
            setError(null);
            setIsInitialLoad(false);

            console.log("Starting data fetch...");
            
            const data = await axiosGetAllAggregatedApplications(accessToken);
            
            // Проверяем не был ли запрос отменен
            if (!abortController.signal.aborted) {
                console.log("Data fetched successfully, items:", data.length);
                setRawData(data);
                setDisplayData(transformDataForDisplay(data));
            }
        } catch (err: any) {
            // Игнорируем ошибки отмены запроса
            if (err.name === 'AbortError' || err.message.includes('aborted')) {
                console.log("Запрос был отменен");
                return;
            }
            
            console.error("Ошибка при загрузке данных:", err);
            setError(err.message || "Произошла ошибка при загрузке данных");
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    };

    const refreshData = () => {
        fetchData();
    };

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Добавим кнопку для ручной загрузки если нужно
    if (isInitialLoad && !loading && !error) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <h4 className="mb-4">Загрузка данных о заявках</h4>
                    <p className="mb-4">Нажмите кнопку ниже для загрузки данных</p>
                    <Button 
                        onClick={fetchData}
                        variant="primary"
                        size="lg"
                    >
                        Загрузить данные
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                    <p className="mt-3">Загрузка данных...</p>
                    <small className="text-muted">Пожалуйста, подождите. Это может занять некоторое время.</small>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <Alert variant="danger">
                    <Alert.Heading>Ошибка загрузки данных</Alert.Heading>
                    <p>{error}</p>
                    
                    {/* Дополнительная информация для отладки */}
                    {error.includes("Таймаут") && (
                        <p className="mb-0 mt-2">
                            <small>
                                Сервер долго не отвечает. Попробуйте обновить позже или проверьте подключение.
                            </small>
                        </p>
                    )}
                    
                    <hr />
                    <div className="d-flex justify-content-end gap-2">
                        <Button 
                            onClick={refreshData} 
                            variant="outline-danger"
                            disabled={loading}
                        >
                            {loading ? 'Загрузка...' : 'Попробовать снова'}
                        </Button>
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Все заявки</h3>
                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-primary" 
                        onClick={refreshData}
                        size="sm"
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : 'Обновить'}
                    </Button>
                    <Badge bg="light" text="dark" className="fs-6">
                        Всего: {displayData.length}
                    </Badge>
                </div>
            </div>

            {displayData.length === 0 ? (
                <Alert variant="info">
                    <Alert.Heading>Заявок не найдено</Alert.Heading>
                    <p>На данный момент нет заявок для отображения.</p>
                    <Button onClick={refreshData} variant="outline-info" size="sm">
                        Обновить
                    </Button>
                </Alert>
            ) : (
                <>
                    <Alert variant="success" className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Данные успешно загружены</strong>
                                <div className="small text-muted">
                                    Последнее обновление: {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                            <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={refreshData}
                                disabled={loading}
                            >
                                {loading ? 'Обновление...' : 'Обновить данные'}
                            </Button>
                        </div>
                    </Alert>
                    
                    <div className="table-responsive">
                        <Table bordered hover size="sm" className="align-middle">
                            <thead className="table-light">
                            <tr>
                                <th>№</th>
                                <th>Фамилия</th>
                                <th>Имя</th>
                                <th>Отчество</th>
                                <th>Дата рождения</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Школа</th>
                                <th>Муниципалитет</th>
                                <th>Олимпиада</th>
                                <th>Профиль</th>
                                <th>Класс</th>
                                <th>Класс участия</th>
                                <th>Пол</th>
                                <th>Гражданство</th>
                                <th>ОВЗ</th>
                                <th>Статус</th>
                                <th>Код</th>
                                <th>Дата подачи</th>
                            </tr>
                            </thead>
                            <tbody>
                            {displayData.map((app, index) => (
                                <tr key={app.id}>
                                    <td className="text-center fw-bold">{index + 1}</td>
                                    <td>{app.surname}</td>
                                    <td>{app.firstname}</td>
                                    <td>{app.patronymic}</td>
                                    <td>{app.birthdate}</td>
                                    <td>
                                        <small className="text-muted">{app.email}</small>
                                    </td>
                                    <td>
                                        <small>{app.phone}</small>
                                    </td>
                                    <td>
                                        <div className="text-truncate" style={{maxWidth: '200px'}} 
                                             title={app.schoolName}>
                                            {app.schoolName}
                                        </div>
                                    </td>
                                    <td>
                                        <small>{app.districtName}</small>
                                    </td>
                                    <td>
                                        <div className="text-truncate" style={{maxWidth: '150px'}}
                                             title={app.olympiadName}>
                                            {app.olympiadName}
                                        </div>
                                    </td>
                                    <td>
                                        {app.profile ? (
                                            <Badge bg="info" text="dark" className="fw-normal">
                                                {app.profile}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <Badge bg="secondary">{app.classNumber}</Badge>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg="primary">{app.category}</Badge>
                                    </td>
                                    <td className="text-center">{app.gender}</td>
                                    <td>{app.citizenship}</td>
                                    <td>{app.disability}</td>
                                    <td>
                                        <Badge bg={getStatusBadgeVariant(app.status)}>
                                            {app.statusText}
                                        </Badge>
                                    </td>
                                    <td>
                                        {app.code ? (
                                            <code className="bg-light p-1 rounded">{app.code}</code>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <small className="text-muted">{app.submittedAt}</small>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted small">
                            Показано заявок: <strong>{displayData.length}</strong>
                        </div>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="link" 
                                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                                size="sm"
                            >
                                ↑ Наверх
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ApplicationsPage;