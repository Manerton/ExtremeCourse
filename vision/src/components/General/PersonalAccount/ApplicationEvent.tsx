import { useEffect, useState } from "react";
import { useAuth } from "../../Helpers/AuthContext";
import {
    axiosGetApplicationEvents,
    axiosRevokeApplication,
    axiosStatusApplication,
} from "../../../requests/ApplicationRequests";
import {
    axiosGetPortfolioByApplicationId,
    PortfolioData,
} from "../../../requests/PortfolioRequests";
import { Button, Badge } from "react-bootstrap";
import PortfolioModal from "./PortfolioModal";

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
    const [portfolios, setPortfolios] = useState<Record<string, PortfolioData | null>>({});
    const [loading, setLoading] = useState(true);

    // Состояния модального окна портфолио
    const [modalShow, setModalShow] = useState(false);
    const [activeApp, setActiveApp] = useState<ApplicationItem | null>(null);

    const { accessToken, user } = useAuth();

    async function fetchPortfolios(apps: ApplicationItem[]) {
        if (!accessToken) return;
        const portfolioMap: Record<string, PortfolioData | null> = {};

        await Promise.all(
            apps.map(async (app) => {
                try {
                    const data = await axiosGetPortfolioByApplicationId(accessToken, app.id);
                    portfolioMap[app.id] = data;
                } catch {
                    portfolioMap[app.id] = null;
                }
            })
        );
        setPortfolios(portfolioMap);
    }

    async function fetchApplicationEvents() {
        try {
            const response = await axiosGetApplicationEvents(accessToken!, user!.id);
            const items: ApplicationItem[] = Array.isArray(response) ? response : response.data || [];
            setEvents(items);
            await fetchPortfolios(items);
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

    const hasActiveApplication = events.some((ev) => ev.status === STATUS_ACTIVE);

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

    const openPortfolioModal = (app: ApplicationItem) => {
        setActiveApp(app);
        setModalShow(true);
    };

    const formatDate = (isoDate: string) => {
        if (!isoDate) return "—";
        return new Date(isoDate).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
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
                            Вы можете иметь только одну активную заявку одновременно, прикреплять и редактировать портфолио.
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

            {/* Таблица для ПК */}
            <table className="table table-bordered table-striped d-none d-md-table align-middle">
                <thead>
                <tr>
                    <th>Программа</th>
                    <th>Дата подачи</th>
                    <th>Класс</th>
                    <th>Статус заявки</th>
                    <th>Портфолио</th>
                    <th style={{ width: "220px" }}>Действия</th>
                </tr>
                </thead>
                <tbody>
                {events.map((ev) => {
                    const isRevoked = ev.status === STATUS_REVOKED;
                    const hasPortfolio = Boolean(portfolios[ev.id]);

                    return (
                        <tr key={ev.id} className={isRevoked ? "text-muted" : ""}>
                            <td>{ev.name}</td>
                            <td>{formatDate(ev.submittedAt)}</td>
                            <td>{ev.name.toLowerCase().includes("эконом") ? "10 - 11" : ev.class_participation}</td>
                            <td>
                                {ev.status === STATUS_ACTIVE ? (
                                    <Badge bg="success">Активная</Badge>
                                ) : ev.status === STATUS_REVOKED ? (
                                    <Badge bg="danger">Отозвана</Badge>
                                ) : (
                                    <Badge bg="secondary">Неизвестно</Badge>
                                )}
                            </td>
                            <td>
                                {hasPortfolio ? (
                                    <Badge bg="success">Прикреплено</Badge>
                                ) : (
                                    <Badge bg="danger">Отсутствует</Badge>
                                )}
                            </td>
                            <td>
                                <div className="d-flex flex-column gap-1">
                                    {!isRevoked && (
                                        <Button
                                            variant={hasPortfolio ? "outline-primary" : "primary"}
                                            size="sm"
                                            onClick={() => openPortfolioModal(ev)}
                                        >
                                            {hasPortfolio ? "Редактировать портфолио" : "Прикрепить портфолио"}
                                        </Button>
                                    )}

                                    {isRevoked ? (
                                        <Button
                                            variant={hasActiveApplication ? "secondary" : "primary"}
                                            size="sm"
                                            disabled={hasActiveApplication}
                                            onClick={() => handleReactivate(ev.id)}
                                        >
                                            {hasActiveApplication ? "Недоступно" : "Подать"}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRevoke(ev.id)}
                                        >
                                            Отозвать заявку
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* Карточки для мобильных устройств */}
            <div className="d-md-none">
                {events.map((ev) => {
                    const isRevoked = ev.status === STATUS_REVOKED;
                    const hasPortfolio = Boolean(portfolios[ev.id]);

                    return (
                        <div key={ev.id} className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <h5 className={`card-title ${isRevoked ? "text-muted" : ""}`}>{ev.name}</h5>

                                <p className="mb-1">
                                    <strong>Дата подачи:</strong> {formatDate(ev.submittedAt)}
                                </p>
                                <p className="mb-1">
                                    <strong>Класс участия:</strong>{" "}
                                    {ev.name.toLowerCase().includes("эконом") ? "10 - 11" : ev.class_participation}
                                </p>
                                <p className="mb-1">
                                    <strong>Статус:</strong>{" "}
                                    {ev.status === STATUS_ACTIVE ? (
                                        <Badge bg="success">Активная</Badge>
                                    ) : (
                                        <Badge bg="danger">Отозвана</Badge>
                                    )}
                                </p>
                                <p className="mb-3">
                                    <strong>Портфолио:</strong>{" "}
                                    {hasPortfolio ? (
                                        <Badge bg="success">Прикреплено</Badge>
                                    ) : (
                                        <Badge bg="danger">Отсутствует</Badge>
                                    )}
                                </p>

                                <div className="d-grid gap-2">
                                    {!isRevoked && (
                                        <Button
                                            variant={hasPortfolio ? "outline-primary" : "primary"}
                                            size="sm"
                                            onClick={() => openPortfolioModal(ev)}
                                        >
                                            {hasPortfolio ? "Редактировать портфолио" : "Прикрепить портфолио"}
                                        </Button>
                                    )}

                                    {isRevoked ? (
                                        <Button
                                            variant={hasActiveApplication ? "secondary" : "primary"}
                                            disabled={hasActiveApplication}
                                            onClick={() => handleReactivate(ev.id)}
                                        >
                                            Подать заявку
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="danger"
                                            onClick={() => handleRevoke(ev.id)}
                                        >
                                            Отозвать заявку
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Модальное окно */}
            {activeApp && (
                <PortfolioModal
                    show={modalShow}
                    onHide={() => {
                        setModalShow(false);
                        setActiveApp(null);
                    }}
                    applicationId={activeApp.id}
                    programName={activeApp.name}
                    subjectName={(activeApp as any).subject || activeApp.name.replace(/^Олимпиадная\s+/i, "")}
                    classParticipation={activeApp.class_participation}
                    token={accessToken!}
                    existingPortfolio={portfolios[activeApp.id]}
                    onSuccess={() => fetchApplicationEvents()}
                />
            )}
        </div>
    );
};

export default ApplicationEventPage;