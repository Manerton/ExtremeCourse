import { useEffect, useState, type ReactNode } from "react";

import { useNavigate } from "react-router-dom";
import type { MainEvent } from "../../../../../types/event";
import EventCart from "../EventCart";
import { axiosGetHistoryEventsByUser } from "../../../../../../requests/ResultRequests";
import { useAuth } from "../../../../../Helpers/AuthContext";


const HistoryTab: React.FC = () => {
    const [events, setEvents] = useState<MainEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const { accessToken, user } = useAuth();


    const navigate = useNavigate();


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const resEvents: MainEvent[] = await axiosGetHistoryEventsByUser(
                    accessToken!,
                    user?.id!
                );
                setEvents(resEvents);
                console.log("История событий:", events);
            } catch (err) {
                console.error("Ошибка загрузки истории:", err);
            } finally {
                setLoading(false);
            }
        };

        if (accessToken && user?.id) {
            fetchEvents();
        } else {
            setLoading(false);
        }
    }, [accessToken, user?.id]);

    if (loading) return <div className="text-center">Загрузка...</div>

    if (events.length === 0) return <div className="text-center text-warning h4">Вы не участвовали в олимпиадах</div>

    function footer(event: MainEvent): ReactNode {
        return (
            <div className="d-flex flex-column justify-content-between h-100">
                <button className="btn btn-primary mb-2" onClick={() => navigate(`/profile/history/${event.id}/result`)}>Результаты</button>
                <button className="btn btn-danger mb-2" onClick={() => navigate(`/profile/history/${event.id}/appeal-create`)}>Подать аппеляцию</button>
            </div >
        )
    }

    return (
        <div>
            {events.map((event) => (
                <EventCart key={event.id} event={event} footer={footer(event)} />
            ))}
        </div>
    );
};


export default HistoryTab;