import { useEffect, useState } from "react";
import type { ApplicationEvent } from "../../../../types/event";
import { StatusIcon } from "../../../../Helpers/StatusBlock";
import EventCart from "./EventCart";
import { axiosGetApplicationEvents } from "../../../../../requests/ApplicationRequests";
import { useAuth } from "../../../../Helpers/AuthContext";
import { useNavigate } from "react-router-dom";


const ApplicationEventTab: React.FC = () => {
    const [events, setEvents] = useState<ApplicationEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const { accessToken, user } = useAuth()
      const navigate = useNavigate();


    useEffect(() => {
        if (!accessToken || !user?.id) return; // защита, если еще не загрузилось

        async function fetchApplicationEvents() {
            try {
                const result = await axiosGetApplicationEvents(accessToken!, user?.id!);
                console.log("result от API:", result); // правильное место для проверки
                setEvents(result);

            } catch (err) {
                console.error("Ошибка загрузки заявок:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchApplicationEvents();
    }, [accessToken, user?.id]);

    // 👇 этот эффект сработает каждый раз, когда allTasks обновится
    useEffect(() => {
        if (events.length > 0) {
            console.log("Обновлённое состояние events:", events);
        }
    }, [events]);


    if (loading) return <div className="text-center ">Загрузка...</div>

    if (events.length === 0) return <div className="text-center text-warning h4">Нет заявок на участие</div>

    function footer(status: number, id: string) {
        return (
            <div className="d-flex flex-column justify-content-between h-100">
                <div className="text-end">
                    <b>Статус заявки  <StatusIcon status={status} /></b>
                </div>
                <div className="text-end">
                   <button className="btn btn-primary" onClick={() => {navigate(`/OlympiadDetails/${id}`);}}>Подробнее</button> 
                </div>
            </div>
        )
    }

    return (
        <div>
            {events.map((event) => (
                <EventCart key={event.MainEvent.id} event={event.MainEvent} footer={footer(event.status, event.MainEvent.id)} />
            ))}
        </div>
    );
};

export default ApplicationEventTab;