import { useEffect, useState } from "react";
import { useAuth } from "../../Helpers/AuthContext";
import {
    axiosGetApplicationEvents,
    axiosRevokeApplication,
    axiosCreateApplication
} from "../../../requests/ApplicationRequests";
import { Application } from "../../types/application";

// Статусы заявки
const STATUS_SUBMITTED = 1; // Отправлена
const STATUS_ACTIVE = 2;    // На рассмотрении / Активна
const STATUS_APPROVED = 3;  // Одобрена
const STATUS_REVOKED = 4;   // Отозвана / Отклонена

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

    // Проверяем, есть ли сейчас активная не отозванная заявка
    const hasActiveApplication = events.some(
        (ev) => ev.status !== STATUS_REVOKED
    );

    // Отзыв заявки (статус меняется на бэкенде)
    async function handleRevoke(applicationId: string) {
        try {
            console.log("Отзыв заявки:", accessToken);
            console.log("Отзыв заявки айди:", applicationId);
            await axiosRevokeApplication(accessToken!, applicationId);

            // Локально переводим статус в отозванный или перезапрашиваем данные
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

    // Повторная подача ранее отозванной заявки
    async function handleReapply(item: ApplicationItem) {
        if (hasActiveApplication) return;

        try {
            const application = {
                userId: user?.id.toString(),
                eventId: item.eventId,
                schoolId: item.schoolId,
                class_participation: item.class_participation,
                profile: item.profile ?? ""
            } as unknown as Application;

            await axiosCreateApplication(accessToken!, application);

            alert("Заявка повторно отправлена!");
            await fetchApplicationEvents();
            onApplied();
        } catch (err) {
            console.error("Ошибка при подаче заявки:", err);
            alert("Ошибка при отправке заявки");
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
                        <h4 className="mb-1">Ваши заявки</h4>
                        <p className="mb-0">
                            Здесь отображаются все поданные вами заявки на участие в смене.
                            Вы можете отслеживать статус рассмотрения или отозвать заявку до окончания регистрации.
                        </p>
                    </div>
                </div>

                <button
                    className="btn btn-outline-primary d-flex align-items-center"
                    onClick={() => {
                        setLoading(true);
                        fetchApplicationEvents();
                    }}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Обновить
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
                        <tr key={ev.id} style={{ opacity: isRevoked ? 0.7 : 1 }}>
                            <td>{ev.name}</td>
                            <td>{formatDate(ev.submittedAt)}</td>
                            <td>{ev.class_participation}</td>
                            <td>{getStatusText(ev.status)}</td>
                            <td className="text-center">
                                {isRevoked ? (
                                    <button
                                        className="btn btn-sm btn-primary w-100"
                                        disabled={hasActiveApplication}
                                        onClick={() => handleReapply(ev)}
                                    >
                                        Подать
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-sm btn-danger w-100"
                                        onClick={() => handleRevoke(ev.id)}
                                    >
                                        Отозвать
                                    </button>
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
                        <div key={ev.id} className="card mb-3 shadow-sm" style={{ opacity: isRevoked ? 0.7 : 1 }}>
                            <div className="card-body">
                                <h5 className="card-title">{ev.name}</h5>

                                <p className="mb-1">
                                    <strong>Дата подачи:</strong> {formatDate(ev.submittedAt)}
                                </p>

                                <p className="mb-1">
                                    <strong>Профиль:</strong> {ev.profile ? ev.profile : "—"}
                                </p>

                                <p className="mb-1">
                                    <strong>Класс участия:</strong> {ev.class_participation}
                                </p>

                                <p className="mb-3">
                                    <strong>Статус:</strong> {getStatusText(ev.status)}
                                </p>

                                {isRevoked ? (
                                    <button
                                        className="btn btn-primary w-100"
                                        disabled={hasActiveApplication}
                                        onClick={() => handleReapply(ev)}
                                    >
                                        Подать заявку
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-danger w-100"
                                        onClick={() => handleRevoke(ev.id)}
                                    >
                                        Отозвать
                                    </button>
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
        case 2: return "Одобрена";
        case 3: return "Отозвана";
        default: return "Неизвестно";
    }
}