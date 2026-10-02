import { useEffect, useState } from "react";
import { ApplicationEvent } from "../../types/event";
import { useAuth } from "../../Helpers/AuthContext";
import { axiosGetApplicationEvents, axiosRevokeApplication } from "../../../requests/ApplicationRequests";

interface Props {
    reloadFlag: number;
    onApplied: () => void;
}

const ApplicationEventPage: React.FC<Props> = ({ onApplied, reloadFlag }) => {
    const [events, setEvents] = useState<ApplicationEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const { accessToken, user } = useAuth();

    async function fetchApplicationEvents() {
        try {
            const result = await axiosGetApplicationEvents(accessToken!, user!.id);
            setEvents(result);
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

    async function handleRevoke(applicationId: string) {
        try {
            await axiosRevokeApplication(accessToken!, applicationId);

            setEvents((prev) => prev.filter(ev => ev.id !== applicationId));

            onApplied();
        } catch (err) {
            console.error("Ошибка отзыва заявки:", err);
        }
    }

    if (loading) return <div className="text-center ">Загрузка...</div>;

    if (events.length === 0)
        return <div className="text-center text-warning h4">Нет заявок на участие</div>;

    return (
        <div className="table-responsive">

            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 border mb-4">

                <div className="d-flex align-items-start">
                    <i className="bi bi-info-circle fs-3 me-3 text-primary"></i>
                    <div>
                        <h4 className="mb-1">Ваши заявки</h4>
                        <p className="mb-0">
                            Здесь отображаются все поданные вами заявки на участие в олимпиадах.
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
            <table className="table table-bordered table-striped d-none d-md-table">
                <thead className="">
                    <tr>
                        <th>Предмет</th>
                        <th>Даты</th>
                        <th>Профиль</th>
                        <th>Класс участия</th>
                        <th>Статус</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((ev) => (
                        <tr key={ev.MainEvent.id}>
                            <td>{ev.MainEvent.name}</td>
                            <td>{ev.MainEvent.dates.join(", ")}</td>
                            <td>{ev.MainEvent.profile ? ev.MainEvent.profile : "—"}</td>
                            <td>{ev.class_participation}</td>
                            <td>{getStatusText(ev.status)}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleRevoke(ev.id)}
                                >
                                    Отозвать
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile View */}
            <div className="d-md-none">
                {events.map((ev) => (
                    <div key={ev.MainEvent.id} className="card mb-3 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">{ev.MainEvent.name}</h5>

                            <p className="mb-1">
                                <strong>Даты:</strong> {ev.MainEvent.dates.join(", ")}
                            </p>

                            <p className="mb-1">
                                <strong>Профиль:</strong>{" "}
                                {ev.MainEvent.profile ? ev.MainEvent.profile : "—"}
                            </p>

                            <p className="mb-1">
                                <strong>Класс участия:</strong> {ev.class_participation}
                            </p>

                            <p className="mb-3">
                                <strong>Статус:</strong> {getStatusText(ev.status)}
                            </p>

                            <button
                                className="btn btn-danger w-100"
                                onClick={() => handleRevoke(ev.id)}
                            >
                                Отозвать
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default ApplicationEventPage;


// Функция превращает статус в текст
function getStatusText(status: number): string {
    switch (status) {
        case 1: return "Отправлена";
        case 2: return "Отклонена";
        case 3: return "Одобрена";
        default: return "Неизвестно";
    }
}
