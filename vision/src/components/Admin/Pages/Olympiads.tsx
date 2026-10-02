import { useEffect, useState } from "react";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../Helpers/AuthContext";
import { MyEvent, UpdateEventDTORequest } from "../../types/event";
import { axiosGetAllOlympiads, axiosStatusUpdate, axiosUpdateEvent } from "../../../requests/EventsRequests";
import { axiosCreateApplication, axiosGenerateCode } from "../../../requests/ApplicationRequests";
import { Application } from "../../types/application";
import { EventStatus, GetEventStatusLabel } from "../../../dictionary/eventStatus";



const OlympiadsAdminTable: React.FC = () => {
    const { user, accessToken } = useAuth();

    const [olympiads, setOlympiads] = useState<MyEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statuses, setStatuses] = useState<Record<string, number>>({});


    const [selectedClasses, setSelectedClasses] = useState<Record<string, number>>({});
    const [selectedProfiles, setSelectedProfiles] = useState<Record<string, string>>({});


    useEffect(() => {
        axiosGetAllOlympiads()
            .then((res) => {
                setOlympiads(res.data)

                const map: Record<string, number> = {}
                res.data.forEach((o: MyEvent) => {
                    map[o.id!] = o.status
                })
                setStatuses(map)
            })
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, []);



  const handleUpdateStatusSubmit = async (olymp: MyEvent) => {
    try {
        const payload: UpdateEventDTORequest = {
            status: statuses[olymp.id!],
        };

        await axiosStatusUpdate(accessToken!, olymp.id!, payload);

        alert("Статус изменён!");
    } catch {
        alert("Ошибка при смене статуса");
    }
};



    const handleCreateParticipantCode = async (eventId: string) => {
        try {
            await axiosGenerateCode(accessToken!, eventId)
            alert("Коды сгенерированны")
        } catch (e) {
            alert("Ошибка при генерации кодов")
        }
    }



    if (loading) return <Spinner />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="table-responsive">

            <Table bordered hover className="align-middle text-center">
                <thead>
                    <tr>
                        <th>Предмет</th>
                        <th>Даты проведения</th>
                        <th>Статус</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {olympiads.map((olymp) => {

                        const fullDates = olymp.dates.join(", ");

                        return (
                            <tr key={olymp.id}>
                                <td>{olymp.name}</td>
                                <td>{fullDates}</td>

                                <td>
                                    <td>{GetEventStatusLabel(olymp.status)}</td>
                                    <select
                                        className="form-select"
                                        value={statuses[olymp.id!]}
                                        onChange={(e) =>
                                            setStatuses({
                                                ...statuses,
                                                [olymp.id!]: Number(e.target.value),
                                            })
                                        }
                                    >
                                        <option value={EventStatus.Register}>{GetEventStatusLabel(EventStatus.Register)}</option>
                                        <option value={EventStatus.Approval}>{GetEventStatusLabel(EventStatus.Approval)}</option>
                                        <option value={EventStatus.Finished}>{GetEventStatusLabel(EventStatus.Finished)}</option>
                                    </select>
                                </td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        className="w-100 mb-2"
                                        onClick={() =>
                                            handleUpdateStatusSubmit(olymp!)
                                        }
                                    >
                                        Сохранить статус
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="w-100"
                                        disabled={
                                            olymp.status === EventStatus.Approval // есть профили, но не выбран
                                        }
                                        onClick={() => handleCreateParticipantCode(olymp.id!)}
                                    >
                                        Создать
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

export default OlympiadsAdminTable;