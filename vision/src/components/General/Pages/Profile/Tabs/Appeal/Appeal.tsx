import { useEffect, useState, type ReactNode } from "react";
import type { MainEvent } from "../../../../../types/event";
import ApplicationEventCart from "../EventCart";
import { useNavigate } from "react-router-dom";
import { axiosGetEventsWithAppealByUser } from "../../../../../../requests/ResultRequests";
import { useAuth } from "../../../../../Helpers/AuthContext";

const AppealTab: React.FC = () => {
    const [events, setEvents] = useState<MainEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate()

    const {accessToken, user} = useAuth()

    useEffect(() => {
        async function fetchAppeal() {
            try {
                const result = await axiosGetEventsWithAppealByUser(accessToken!, user?.id!);
                console.log("Events with APPEAL", result)
                setEvents(result);
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchAppeal()
    }, [])


    if (loading) return <div className="text-center">Загрузка...</div>

    if (events.length === 0) return <div className="text-center text-warning h4">Вы не подавали аппеляции</div>

    function footer(event: MainEvent): ReactNode {
        return (
            <div className="d-flex flex-column justify-content-between h-100">
                <button className="btn btn-primary mb-2" onClick={() => navigate(`/profile/appeals/${event.id}/list`)}>Подробнее</button>
            </div>
        )
    }

    return (
        <div>
            {events.map((event) => (
                <ApplicationEventCart key={event.id} event={event} footer={footer(event)} />
            ))}
        </div>
    );
};




export default AppealTab;