import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface Event {
    id: string;
    name: string;
    subject: string;
    start_date: string;
    end_date: string;
    class_number: string;
    finished: string;
}

interface SubjectDictionary {
    [key: string]: string;
}
interface EventStatusDictionary {
    [key: string]: string;
}
const EventIndex: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [subjects, setSubjects] = useState<SubjectDictionary>({});
    const [statuses, setStatuses] = useState<EventStatusDictionary>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalEvents, setTotalEvents] = useState<number>(0);
    const [perPage] = useState<number>(10);
    const navigate = useNavigate();

    const {accessToken} = useAuth()
    

    const fetchEvents = (page: number = 1) => {
        setLoading(true);
        axios.get(HOSTS['OLYMP_ADMIN'] + `/api/event/index/${page}`, {
            headers: {
                'Authorization': accessToken
            },
            withCredentials: true
        })
        .then(response => {
            setEvents(response.data.events || []);
            setSubjects(response.data.subjects || {});
            setStatuses(response.data.statuses || {});
            setTotalEvents(response.data.eventsAmount || 0);
            setCurrentPage(page);
            setLoading(false);
        })
        .catch(error => {
            console.error("Error fetching events:", error);
            setLoading(false);
        });
    };

    const handleDelete = async (eventId: string) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
            return;
        }
        try {
            await axios.delete(HOSTS['OLYMP_ADMIN'] + `/api/event/delete/${eventId}`, {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            fetchEvents(currentPage); // Refresh the list after deletion
        } catch (error) {
            console.error('Delete error:', error);
            alert('Не удалось удалить олимпиаду');
        }
    };

    useEffect(() => {
        fetchEvents(currentPage);
    }, [currentPage]);

    if (loading) return <div className="text-center mt-4"><p>Загрузка...</p></div>;

    const totalPages = Math.ceil(totalEvents / perPage);

    return (
        <div className="event-index container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Список олимпиад</h2>
                <button 
                    onClick={() => navigate('/olymp-admin/event/create')}
                    className="btn btn-success"
                >
                    Добавить олимпиаду
                </button>
            </div>

            <table className="table table-bordered table-striped">
                <thead className="thead-dark">
                <tr>
                    <th>#</th>
                    <th>Название олимпиады</th>
                    <th>Предмет</th>
                    <th>Дата начала</th>
                    <th>Дата окончания</th>
                    <th>Возрастная категория</th>
                    <th>Статус публикации</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                    {events.map((event, index) => (
                        <tr key={event.id}>
                            <td>{(currentPage - 1) * perPage + index + 1}</td>
                            <td>{event.name}</td>
                            <td>{subjects[event.subject] || event.subject}</td>
                            <td>{event.start_date}</td>
                            <td>{event.end_date}</td>
                            <td>{event.class_number} класс</td>
                            <td>{statuses[event.finished]}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => navigate(`/olymp-admin/event/show/${event.id}`)}
                                >
                                    Просмотр
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(event.id)}
                                >
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination mt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        className={`btn btn-sm mx-1 ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EventIndex;