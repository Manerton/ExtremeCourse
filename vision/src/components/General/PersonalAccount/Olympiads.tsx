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

interface NewlyCreatedApplicationData {
    id: string;
    programName: string;
    subjectName: string;
    classParticipation: number;
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
    const [submittingEventId, setSubmittingEventId] = useState<string | null>(null);

    // Стейты для управления модальным окном портфолио
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [newApplication, setNewApplication] = useState<NewlyCreatedApplicationData | null>(null);

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

    const handleSubmit = async (event: Event) => {
        if (hasActiveApplication) return;
        setActionError(null);

        if (user_class && user_class > event.class && !isEconomics(event)) {
            setActionError(
                `Вы учитесь в ${user_class} классе и не можете подать заявку на программу для ${event.class} класса. Участие возможно только в программах своего класса или старше.`
            );
            return;
        }

        try {
            setSubmittingEventId(event.id);

            const applicationPayload = {
                userId: user?.id.toString(),
                eventId: event.id,
                schoolId: user_school_id,
                class_participation: event.class,
            } as unknown as Application;

            // 1. Создаем заявку на бэкенде
            const response = await axiosCreateApplication(accessToken!, applicationPayload);

            // Извлекаем application_id из response.data или response
            const payload = response?.data ?? response;
            const applicationId = payload?.application_id || payload?.id;

            if (applicationId) {
                // 2. Просто открываем окно. Никаких GET-запросов портфолио здесь нет!
                setNewApplication({
                    id: applicationId,
                    programName: event.name,
                    subjectName: event.subject || event.name.replace(/^Олимпиадная\s+/i, ""),
                    classParticipation: event.class,
                });
                setShowPortfolioModal(true);
            } else {
                alert("Заявка создана! Вам необходимо прикрепить портфолио в разделе «Мои заявки».");
                onApplied();
            }
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
                    alert(message);
                    return;
                }
            }

            const fallbackError = "Произошла ошибка при отправке заявки. Попробуйте позже.";
            setActionError(fallbackError);
            alert(fallbackError);
        } finally {
            setSubmittingEventId(null);
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
        const isSubmittingThis = submittingEventId === olymp.id;
        const isDisabled = hasActiveApplication || isTooOld || Boolean(submittingEventId);

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
                onClick={() => handleSubmit(olymp)}
            >
                {isSubmittingThis
                    ? "Создание..."
                    : hasActiveApplication
                        ? "Недоступно"
                        : isTooOld
                            ? "Недоступно"
                            : "Подать заявку"}
            </Button>
        );

        if (isDisabled && tooltipText) {
            return (
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip id={`tooltip-${olymp.id}`}>
                            {tooltipText}
                        </Tooltip>
                    }
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
                        <strong> «Подать заявку»</strong>, после чего откроется форма для прикрепления портфолио.
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

            {/* Модальное окно портфолио, открывающееся сразу после подачи */}
            {newApplication && (
                <PortfolioModal
                    show={showPortfolioModal}
                    onHide={() => {
                        // Закрыли без сохранения — теперь обновляем список, чтобы отобразить созданную заявку
                        setShowPortfolioModal(false);
                        setNewApplication(null);
                        onApplied();
                    }}
                    applicationId={newApplication.id}
                    programName={newApplication.programName}
                    subjectName={newApplication.subjectName}
                    classParticipation={newApplication.classParticipation}
                    token={accessToken!}
                    existingPortfolio={null} // Заведомо null: режим создания, никаких запросов
                    onSuccess={() => {
                        // Сохранили портфолио — теперь обновляем список
                        setShowPortfolioModal(false);
                        setNewApplication(null);
                        onApplied();
                    }}
                />
            )}
        </div>
    );
};

export default OlympiadsSimpleTable;