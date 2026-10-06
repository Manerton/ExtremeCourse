import { useEffect, useState } from "react";
import { useAuth } from "../../Helpers/AuthContext";
import {
    axiosGetApplicationEvents,
    axiosRevokeApplication,
    axiosStatusApplication
} from "../../../requests/ApplicationRequests";
import { Button } from "react-bootstrap";

const STATUS_ACTIVE = 2;   // Активная
const STATUS_REVOKED = 3;  // Отозвана

export interface ApplicationItem {
    id: string;
    userId: string;
    schoolId: string;
    name: string;
    eventId: string;
    profile: string;
    class_participation: number;
    status: number;
    submittedAt: string;
    updatedAt: string;
}

interface Props {
    reloadFlag: number;
    onApplied: () => void;
}

const ApplicationEventPage: React.FC<Props> = ({ onApplied, reloadFlag }) => {
    const [events, setEvents] = useState<ApplicationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { accessToken, user } = useAuth();

    async function fetchApplicationEvents() {
        try {
            const response = await axiosGetApplicationEvents(accessToken!, user!.id);
            const items = Array.isArray(response) ? response : response.data;
            setEvents(items || []);
        } catch (err) {
            console.error("Ошибка загрузки заявок:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!accessToken || !user?.id) return;

        fetchApplicationEvents();
    }, [accessToken, user?.id, reloadFlag]);

    // Проверяем, есть ли хотя бы одна заявка со статусом 2 (Активная)
    const hasActiveApplication = events.some((ev) => ev.status === STATUS_ACTIVE);

    // Отзыв заявки
    async function handleRevoke(applicationId: string) {
        try {
            await axiosRevokeApplication(accessToken!, applicationId);

            setEvents((prev) =>
                prev.map((ev) =>
                    ev.id === applicationId ? { ...ev, status: STATUS_REVOKED } : ev
                )
            );

            onApplied();
        } catch (err) {
            console.error("Ошибка отзыва заявки:", err);
            alert("Ошибка при отзыве заявки");
        }
    }

    // Переподача / Активация отозванной заявки через смену статуса
    async function handleReactivate(applicationId: string) {
        if (hasActiveApplication) return;

        try {
            await axiosStatusApplication(accessToken!, applicationId);

            alert("Заявка успешно повторно активирована!");
            await fetchApplicationEvents();
            onApplied();
        } catch (err) {
            console.error("Ошибка при смене статуса заявки:", err);
            alert("Не удалось активировать заявку");
        }
    }

    const formatDate = (isoDate: string) => {
        if (!isoDate) return "—";
        return new Date(isoDate).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    if (loading) return <div className="text-center py-4">Загрузка...</div>;

    if (events.length === 0)
        return <div className="text-center text-warning h4 py-4">Нет заявок на участие</div>;

    return (
        <div className="table-responsive">
            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 border mb-4">
                <div className="d-flex align-items-start">
                    <i className="bi bi-info-circle fs-3 me-3 text-primary"></i>
                    <div>
                        <p className="mb-0">
                            Здесь отображаются все поданные вами заявки на участие в смене.
                            Вы можете иметь только одну активную заявку одновременно.
                        </p>
                    </div>
                </div>

                <button
                    className="btn btn-outline-primary d-flex align-items-center"
                    onClick={() => {
                        setLoading(true);
                        fetchApplicationEvents();
                    }}
                >Обновить
                </button>
            </div>

            {/* PC / Tablet View */}
            <table className="table table-bordered table-striped d-none d-md-table align-middle">
                <thead>
                <tr>
                    <th>Программа</th>
                    <th>Дата подачи</th>
                    <th>Класс участия</th>
                    <th>Статус</th>
                    <th style={{ width: "160px" }}>Действие</th>
                </tr>
                </thead>
                <tbody>
                {events.map((ev) => {
                    const isRevoked = ev.status === STATUS_REVOKED;

                    return (
                        <tr key={ev.id} className={isRevoked ? "text-muted" : ""}>
                            <td>{ev.name}</td>
                            <td>{formatDate(ev.submittedAt)}</td>
                            <td>{ev.class_participation}</td>
                            <td>{getStatusText(ev.status)}</td>
                            <td className="text-center">
                                {isRevoked ? (
                                    <Button
                                        variant={hasActiveApplication ? "secondary" : "primary"}
                                        size="sm"
                                        className="w-100"
                                        disabled={hasActiveApplication}
                                        onClick={() => handleReactivate(ev.id)}
                                    >
                                        {hasActiveApplication ? "Недоступно" : "Подать"}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="w-100"
                                        onClick={() => handleRevoke(ev.id)}
                                    >
                                        Отозвать
                                    </Button>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* Mobile View */}
            <div className="d-md-none">
                {events.map((ev) => {
                    const isRevoked = ev.status === STATUS_REVOKED;

                    return (
                        <div key={ev.id} className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <h5 className={`card-title ${isRevoked ? "text-muted" : ""}`}>{ev.name}</h5>

                                <p className="mb-1">
                                    <strong>Дата подачи:</strong> {formatDate(ev.submittedAt)}
                                </p>

                                <p className="mb-1">
                                    <strong>Класс участия:</strong> {ev.name.toLowerCase().includes("эконом") ? "10 - 11" : ev.class_participation}
                                </p>

                                <p className="mb-3">
                                    <strong>Статус:</strong> {getStatusText(ev.status)}
                                </p>

                                {isRevoked ? (
                                    <Button
                                        variant={hasActiveApplication ? "secondary" : "primary"}
                                        className="w-100"
                                        disabled={hasActiveApplication}
                                        onClick={() => handleReactivate(ev.id)}
                                    >
                                        {hasActiveApplication ? "Недоступно" : "Подать заявку"}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="danger"
                                        className="w-100"
                                        onClick={() => handleRevoke(ev.id)}
                                    >
                                        Отозвать
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ApplicationEventPage;

function getStatusText(status: number): string {
    switch (status) {
        case STATUS_ACTIVE: return "Активная";
        case STATUS_REVOKED: return "Отозвана";
        default: return "Неизвестно";
    }
}