import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { useAuth } from "../../Helpers/AuthContext";
import { Event, UpdateStatusEventDTORequest } from "../../types/event";
import { axiosGetAllOlympiads, axiosStatusUpdate } from "../../../requests/EventsRequests";

// Константы статусов согласно бэкенду (1 = Closed, 2 = Open)
const STATUS_CLOSED = 1;
const STATUS_OPEN = 2;

const OlympiadsAdminTable: React.FC = () => {
    const { accessToken } = useAuth();

    const [olympiads, setOlympiads] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) {
            setLoading(false);
            return;
        }

        axiosGetAllOlympiads(accessToken)
            .then((res) => {
                // Если бэкенд оборачивает массив в поле data (например, res.data.data), 
                // скорректируйте эту строчку при необходимости
                setOlympiads(res.data);
            })
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, [accessToken]);

    const handleUpdateStatus = async (eventId: string, newStatus: number) => {
        if (!accessToken) return;

        try {
            setUpdatingId(eventId);
            const payload: UpdateStatusEventDTORequest = {
                status: newStatus,
            };

            await axiosStatusUpdate(accessToken, eventId, payload);

            // Обновляем состояние локально, чтобы интерфейс сразу отобразил изменения
            setOlympiads((prev) =>
                prev.map((item) =>
                    item.id === eventId ? { ...item, status: newStatus } : item
                )
            );
        } catch (e) {
            alert("Ошибка при смене статуса");
        } finally {
            setUpdatingId(null);
        }
    };

    const renderStatusBadge = (status: number) => {
        switch (status) {
            case STATUS_OPEN:
                return <Badge bg="success">Открыто</Badge>;
            case STATUS_CLOSED:
                return <Badge bg="secondary">Закрыто</Badge>;
            default:
                return <Badge bg="warning">Неизвестно ({status})</Badge>;
        }
    };

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="table-responsive">
            <Table bordered hover className="align-middle text-center">
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Предмет</th>
                        <th>Класс</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {olympiads.map((olymp) => {
                        const isUpdating = updatingId === olymp.id;

                        return (
                            <tr key={olymp.id}>
                                <td>{olymp.name}</td>
                                <td>{olymp.subject}</td>
                                <td>{olymp.class}</td>
                                <td>{renderStatusBadge(olymp.status)}</td>
                                <td>
                                    <div className="d-flex justify-content-center gap-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            disabled={olymp.status === STATUS_OPEN || isUpdating}
                                            onClick={() => handleUpdateStatus(olymp.id, STATUS_OPEN)}
                                        >
                                            Открыть
                                        </Button>

                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={olymp.status === STATUS_CLOSED || isUpdating}
                                            onClick={() => handleUpdateStatus(olymp.id, STATUS_CLOSED)}
                                        >
                                            Закрыть
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
};

export default OlympiadsAdminTable;