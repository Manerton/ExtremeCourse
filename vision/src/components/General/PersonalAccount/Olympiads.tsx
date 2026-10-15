import { useEffect, useState } from "react";
import { Table, Button, Spinner, Alert, OverlayTrigger, Tooltip, Card } from "react-bootstrap";
import { useAuth } from "../../Helpers/AuthContext";
import { Event } from "../../types/event";
import { fetchSimpleOlympiads } from "../../../requests/EventsRequests";
import { axiosCreateApplication } from "../../../requests/ApplicationRequests";
import { Application } from "../../types/application";
import PortfolioModal from "./PortfolioModal";
import axios from "axios";

interface Props {
    user_class: number;
    user_school_id: string;
    reloadFlag: number;
    onApplied: () => void;
    appliedEventIds: string[];
    hasActiveApplication?: boolean;
}

const OlympiadsSimpleTable: React.FC<Props> = ({
    user_class,
    user_school_id,
    onApplied,
    reloadFlag,
    appliedEventIds,
    hasActiveApplication = false
}) => {
    const { user, accessToken } = useAuth();

    const [olympiads, setOlympiads] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Стейты для модального окна (храним выбранную программу до фактического создания заявки)
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [pendingEvent, setPendingEvent] = useState<Event | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        setLoading(true);
        fetchSimpleOlympiads(accessToken)
            .then((res) => setOlympiads(res.data))
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, [reloadFlag, accessToken]);

    const isEconomics = (olymp: Event) => {
        return (
            olymp.name.toLowerCase().includes("эконом") ||
            olymp.subject.toLowerCase().includes("эконом")
        );
    };

    // Шаг 1: При нажатии "Подать заявку" только проверяем класс и открываем модалку
    const handleOpenModal = (event: Event) => {
        if (hasActiveApplication) return;
        setActionError(null);

        if (user_class && user_class > event.class && !isEconomics(event)) {
            setActionError(
                `Вы учитесь в ${user_class} классе и не можете подать заявку на программу для ${event.class} класса. Участие возможно только в программах своего класса или старше.`
            );
            return;
        }

        setPendingEvent(event);
        setShowPortfolioModal(true);
    };

    // Шаг 2: Функция создания заявки, которая вызовется ВНУТРИ модального окна при подтверждении
    const handleCreateApplication = async (event: Event): Promise<string> => {
        const applicationPayload = {
            userId: user?.id.toString(),
            eventId: event.id,
            schoolId: user_school_id,
            class_participation: event.class,
        } as unknown as Application;

        try {
            const response = await axiosCreateApplication(accessToken!, applicationPayload);
            const payload = response?.data ?? response;
            const applicationId = payload?.application_id || payload?.id;

            if (!applicationId) {
                throw new Error("Не удалось получить ID созданной заявки от сервера.");
            }

            return applicationId;
        } catch (e: any) {
            console.error("Ошибка при отправке заявки:", e);

            if (axios.isAxiosError(e) && e.response) {
                const responseData = e.response.data;

                if (
                    e.response.status === 400 &&
                    (responseData?.message === "user not allowed" ||
                        responseData?.error === "BAD_REQUEST")
                ) {
                    const message = `Невозможно подать заявку: ваш текущий класс (${user_class}) старше, чем класс проведения программы (${event.class} класс). Вы можете участвовать только в олимпиадах для своего класса или более старших параллелей.`;
                    setActionError(message);
                    throw new Error(message);
                }
            }

            throw new Error(
                e.response?.data?.message || "Произошла ошибка при создании заявки. Попробуйте позже."
            );
        }
    };

    if (loading) return <Spinner />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    const availableOlympiads = olympiads.filter((olymp) => !appliedEventIds.includes(olymp.id));

    const renderClassLabel = (olymp: Event) => {
        if (isEconomics(olymp)) {
            return "10 - 11";
        }
        return olymp.class;
    };

    const renderActionButton = (olymp: Event) => {
        const isTooOld = Boolean(user_class && user_class > olymp.class && !isEconomics(olymp));
        const isDisabled = hasActiveApplication || isTooOld;

        const tooltipText = hasActiveApplication
            ? "У вас уже есть активная заявка. Отзовите её, чтобы выбрать другую программу."
            : isTooOld
                ? `Программа рассчитана на ${olymp.class} класс. Участие для учащихся ${user_class} класса недоступно.`
                : "";

        const buttonNode = (
            <Button
                variant={isDisabled ? "secondary" : "primary"}
                className="w-100"
                disabled={isDisabled}
                style={isDisabled ? { pointerEvents: "none" } : undefined}
                onClick={() => handleOpenModal(olymp)}
            >
                {hasActiveApplication || isTooOld ? "Недоступно" : "Подать заявку"}
            </Button>
        );

        if (isDisabled && tooltipText) {
            return (
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id={`tooltip-${olymp.id}`}>{tooltipText}</Tooltip>}
                >
                    <span className="d-block w-100" tabIndex={0}>
                        {buttonNode}
                    </span>
                </OverlayTrigger>
            );
        }

        return buttonNode;
    };

    return (
        <div>
            {actionError && (
                <Alert
                    variant="danger"
                    className="mb-4"
                    dismissible
                    onClose={() => setActionError(null)}
                >
                    <Alert.Heading className="h6 mb-1">Ограничение по классу участия</Alert.Heading>
                    {actionError}
                </Alert>
            )}

            {hasActiveApplication && (
                <Alert variant="warning" className="mb-4">
                    У вас уже есть активная заявка. Подача новой заявки недоступна. Отзовите предыдущую заявку в списке «Мои заявки», чтобы подать новую.
                </Alert>
            )}

            <div className="d-flex align-items-start bg-light p-3 rounded-3 border mb-4">
                <i className="bi bi-info-circle fs-3 me-3 text-primary"></i>
                <div>
                    <h4 className="mb-1">Внимание</h4>
                    <p className="mb-0">
                        Пожалуйста, выберите интересующую вас программу и нажмите кнопку
                        <strong> «Подать заявку»</strong>, после чего откроется форма для заполнения портфолио и подтверждения заявки.
                    </p>
                </div>
            </div>

            {availableOlympiads.length === 0 ? (
                <div className="text-center text-muted py-4 border rounded bg-light">
                    Нет доступных программ для подачи заявки
                </div>
            ) : (
                <>
                    {/* Версия для ПК и планшетов */}
                    <div className="table-responsive d-none d-md-block">
                        <Table bordered hover className="align-middle text-center mb-0">
                            <thead>
                            <tr>
                                <th>Программа</th>
                                <th>Класс</th>
                                <th style={{ width: "220px" }}>Действие</th>
                            </tr>
                            </thead>
                            <tbody>
                            {availableOlympiads.map((olymp) => (
                                <tr
                                    key={olymp.id}
                                    style={{
                                        opacity:
                                            hasActiveApplication ||
                                            (user_class && user_class > olymp.class && !isEconomics(olymp))
                                                ? 0.65
                                                : 1
                                    }}
                                >
                                    <td>{olymp.name}</td>
                                    <td>{renderClassLabel(olymp)}</td>
                                    <td>{renderActionButton(olymp)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>

                    {/* Мобильная версия */}
                    <div className="d-md-none">
                        {availableOlympiads.map((olymp) => (
                            <Card
                                key={olymp.id}
                                className="mb-3 shadow-sm"
                                style={{
                                    opacity:
                                        hasActiveApplication ||
                                        (user_class && user_class > olymp.class && !isEconomics(olymp))
                                            ? 0.75
                                            : 1
                                }}
                            >
                                <Card.Body>
                                    <Card.Title className="h5 mb-2">{olymp.name}</Card.Title>
                                    <p className="mb-3 text-muted">
                                        <strong>Класс:</strong> {renderClassLabel(olymp)}
                                    </p>

                                    {renderActionButton(olymp)}
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Модальное окно портфолио: если закрыть его крестиком или кнопкой "Отмена", заявка НЕ создается */}
            {pendingEvent && (
                <PortfolioModal
                    show={showPortfolioModal}
                    onHide={() => {
                        setShowPortfolioModal(false);
                        setPendingEvent(null);
                    }}
                    onCreateApplication={() => handleCreateApplication(pendingEvent)}
                    programName={pendingEvent.name}
                    subjectName={pendingEvent.subject || pendingEvent.name.replace(/^Олимпиадная\s+/i, "")}
                    classParticipation={pendingEvent.class}
                    token={accessToken!}
                    existingPortfolio={null}
                    onSuccess={() => {
                        setShowPortfolioModal(false);
                        setPendingEvent(null);
                        onApplied();
                    }}
                />
            )}
        </div>
    );
};

export default OlympiadsSimpleTable;