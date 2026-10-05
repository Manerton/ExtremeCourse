import { useEffect, useState } from "react";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../Helpers/AuthContext";
import { Event } from "../../types/event";
import { fetchSimpleOlympiads } from "../../../requests/EventsRequests";
import { axiosCreateApplication } from "../../../requests/ApplicationRequests";
import { Application } from "../../types/application";

interface Props {
    user_class: number;
    user_school_id: string;
    reloadFlag: number;
    onApplied: () => void;
    appliedEventIds: string[];
}

const OlympiadsSimpleTable: React.FC<Props> = ({
                                                   user_class,
                                                   user_school_id,
                                                   onApplied,
                                                   reloadFlag,
                                                   appliedEventIds
                                               }) => {
    const { user, accessToken } = useAuth();

    const [olympiads, setOlympiads] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Проверяем, есть ли уже хотя бы одна поданная заявка
    const hasAppliedEvents = appliedEventIds.length > 0;

    useEffect(() => {
        if (!accessToken) return;

        setLoading(true);
        fetchSimpleOlympiads(accessToken)
            .then((res) => setOlympiads(res.data))
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, [reloadFlag, accessToken]);

    const handleSubmit = async (event: Event) => {
        if (hasAppliedEvents) return;

        try {
            const application = {
                userId: user?.id.toString(),
                eventId: event.id,
                schoolId: user_school_id,
                class_participation: event.class,
            } as unknown as Application;

            await axiosCreateApplication(accessToken!, application);

            alert("Заявка отправлена!");
            onApplied();
        } catch (e) {
            alert("Ошибка при отправке заявки");
        }
    };

    if (loading) return <Spinner />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    // Фильтруем события по классу (показываем только те, где класс события >= классу ученика)
    //const availableOlympiads = olympiads.filter((olymp) => olymp.class >= user_class);
    const availableOlympiads = olympiads
    return (
        <div className="table-responsive">
            {hasAppliedEvents && (
                <Alert variant="warning" className="mb-4">
                    Вы уже подали заявку. Подача повторных заявок недоступна. Отзовите предыдущую заявку, чтобы подать новую.
                </Alert>
            )}

            <div className="d-flex align-items-start bg-light p-3 rounded-3 border mb-4">
                <i className="bi bi-info-circle fs-3 me-3 text-primary"></i>
                <div>
                    <h4 className="mb-1">Внимание</h4>
                    <p className="mb-0">
                        Пожалуйста, выберите интересующую вас программу и нажмите кнопку
                        <strong> «Подать заявку»</strong>.
                    </p>
                </div>
            </div>

            <Table bordered hover className="align-middle text-center">
                <thead>
                <tr>
                    <th>Программа</th>
                    <th>Предмет</th>
                    <th>Класс</th>
                    <th>Действие</th>
                </tr>
                </thead>

                <tbody>
                {availableOlympiads.map((olymp) => (
                    <tr
                        key={olymp.id}
                        style={{ opacity: hasAppliedEvents ? 0.65 : 1 }}
                    >
                        <td>{olymp.name}</td>
                        <td>{olymp.subject}</td>
                        <td>{olymp.class}</td>
                        <td>
                            <Button
                                variant={hasAppliedEvents ? "secondary" : "primary"}
                                className="w-100"
                                disabled={hasAppliedEvents}
                                onClick={() => handleSubmit(olymp)}
                            >
                                {hasAppliedEvents ? "Недоступно" : "Подать заявку"}
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
};

export default OlympiadsSimpleTable;