import { useEffect, useState } from "react";
import { Table, Button, Form, Spinner, Alert, Card } from "react-bootstrap";
import { useAuth } from "../../Helpers/AuthContext";
import axios from "axios";
import { MyEvent } from "../../types/event";
import { fetchSimpleOlympiads } from "../../../requests/EventsRequests";
import { useParams } from "react-router-dom";
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

    const [olympiads, setOlympiads] = useState<MyEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedClasses, setSelectedClasses] = useState<Record<string, number>>({});
    const [selectedProfiles, setSelectedProfiles] = useState<Record<string, string>>({});

    const visibleOlympiads = olympiads.filter(o => !appliedEventIds.includes(o.id!));

    useEffect(() => {
        if (!accessToken) return;

        setLoading(true);
        fetchSimpleOlympiads(accessToken)
            .then((res) => setOlympiads(res.data))
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, [reloadFlag, accessToken]);

    const handleClassChange = (eventId: string, value: number) => {
        setSelectedClasses((prev) => ({ ...prev, [eventId]: value }));
    };

    const handleProfileChange = (eventId: string, value: string) => {
        setSelectedProfiles((prev) => ({ ...prev, [eventId]: value }));
    };

    const handleSubmit = async (eventId: string) => {
        const classNumber = selectedClasses[eventId];
        if (!classNumber) {
            alert("Выберите класс участия");
            return;
        }

        try {


            let application = {
                userId: user?.id.toString(),
                eventId: eventId,
                schoolId: user_school_id,
                class_participation: classNumber,
                profile: selectedProfiles[eventId] ?? ""
            } as Application

            await axiosCreateApplication(accessToken!, application)

            alert("Заявка отправлена!");
            onApplied();
        } catch (e) {
            alert("Ошибка при отправке заявки");
        }
    };

    if (loading) return <Spinner />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="table-responsive">
            <div className="d-flex align-items-start bg-light p-3 rounded-3 border mb-4">
                <i className="bi bi-info-circle fs-3 me-3 text-primary"></i>
                <div>
                    <h4 className="mb-1">Внимание</h4>
                    <p className="mb-0">
                        Пожалуйста, выберите интересующую вас олимпиаду.
                        Укажите класс участия и профиль (если он предусмотрен), а затем нажмите кнопку
                        <strong> «Подать заявку»</strong>.
                    </p>
                </div>
            </div>

            <Table bordered hover className="align-middle text-center">
                <thead>
                    <tr>
                        <th>Предмет</th>
                        <th>Даты проведения</th>
                        <th>Класс участия</th>
                        <th>Профиль</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {visibleOlympiads.map((olymp) => {

                        const fullDates = olymp.dates.join(", ");

                        return (
                            <tr key={olymp.id}>
                                <td>{olymp.name}</td>

                                <td>{fullDates}</td>

                                <td>
                                    {[9, 10, 11]
                                        .filter((c) => c >= user_class)
                                        .map((c) => (
                                            <Form.Check
                                                key={c}
                                                inline
                                                label={c.toString()}
                                                type="radio"
                                                name={`class-${olymp.id}`}
                                                checked={selectedClasses[olymp.id!] === c}
                                                onChange={() => handleClassChange(olymp.id!, c)}
                                            />
                                        ))}
                                </td>

                                <td>
                                    {olymp.profiles && olymp.profiles.length > 0 ? (
                                        <Form.Select
                                            value={selectedProfiles[olymp.id!] ?? "none"}
                                            onChange={(e) => handleProfileChange(olymp.id!, e.target.value)}
                                        >
                                            <option value="none">Выберите профиль</option>
                                            {olymp.profiles.map((ev) => (
                                                <option key={ev} value={ev}>
                                                    {ev}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    ) : (
                                        "—"
                                    )}
                                </td>

                                <td>
                                    <Button
                                        variant="primary"
                                        className="w-100"
                                        disabled={
                                            !selectedClasses[olymp.id!] || // не выбран класс
                                            (olymp.profiles?.length > 0 &&
                                                (!selectedProfiles[olymp.id!] || selectedProfiles[olymp.id!] === "none")) // есть профили, но не выбран
                                        }
                                        onClick={() => handleSubmit(olymp.id!)}
                                    >
                                        Подать заявку
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
};

export default OlympiadsSimpleTable;