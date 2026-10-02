import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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

interface EventJury {
    id: string;
    userAPI: {
        firstname?: string;
        surname?: string;
        patronymic?: string;
    };
}

interface SubjectDictionary {
    [key: string]: string;
}
interface EventStatusDictionary {
    [key: string]: string;
}
const EventShow: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [eventJuries, setEventJuries] = useState<EventJury[]>([]);
    const [subjects, setSubjects] = useState<SubjectDictionary>({});
    const [statuses, setStatuses] = useState<EventStatusDictionary>({});
    const [loading, setLoading] = useState(true);

    const {accessToken} = useAuth()


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(HOSTS['OLYMP_ADMIN'] + `/api/event/show/${id}`, {
                    headers: { 'Authorization': accessToken }
                });

                setEvent(response.data.event);
                setEventJuries(response.data.eventJuries || []);
                setSubjects(response.data.subjects || {});
                setStatuses(response.data.statuses || {});
                setLoading(false);
            } catch (error) {
                console.error('Error fetching event data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить эту олимпиаду?')) {
            return;
        }

        try {
            await axios.delete(HOSTS['OLYMP_ADMIN'] + `/api/event/delete/${id}`, {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            navigate('/olymp-admin/event/index');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Не удалось удалить олимпиаду');
        }
    };

    const getFullName = (user: { firstname?: string; surname?: string; patronymic?: string }) => {
        return `${user.firstname || ''} ${user.surname || ''} ${user.patronymic || ''}`.trim();
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd.MM.yyyy HH:mm');
        } catch {
            return dateString;
        }
    };

    const getEventStatus = () => {
        if (!event) return null;
        const now = new Date();
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        if (now < startDate) {
            return { text: 'Предстоящая', class: 'bg-warning text-dark' };
        } else if (now >= startDate && now <= endDate) {
            return { text: 'Идет сейчас', class: 'bg-success' };
        } else {
            return { text: 'Завершена', class: 'bg-secondary' };
        }
    };

    if (loading) return <div className="text-center mt-4"><p>Загрузка...</p></div>;
    if (!event) return <div className="text-center mt-4"><p>Олимпиада не найдена</p></div>;

    const status = getEventStatus();

    return (
        <div className="event-show container mt-4">
            <h1>{event.name}</h1>

            <div className="card mt-4">
                <div className="card-body">deno
                    <div className="row">
                        <div className="col-md-6">
                            <h5 className="card-title">Основная информация</h5>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item">
                                    <strong>Предмет:</strong> {subjects[event.subject] || event.subject}
                                </li>
                                <li className="list-group-item">
                                    <strong>Дата начала:</strong> {formatDate(event.start_date)}
                                </li>
                                <li className="list-group-item">
                                    <strong>Дата окончания:</strong> {formatDate(event.end_date)}
                                </li>
                                <li className="list-group-item">
                                    <strong>Возрастная категория:</strong> {event.class_number} класс
                                </li>
                                <li className="list-group-item">
                                    <strong>Статус публикации:</strong> {statuses[event.finished]}
                                </li>
                                <li className="list-group-item">
                                    <strong>Список жюри:</strong>
                                    {eventJuries.length > 0 ? (
                                        eventJuries.map(jury => (
                                            <div key={jury.id}>{getFullName(jury.userAPI)}</div>
                                        ))
                                    ) : (
                                        <div>Нет назначенных жюри</div>
                                    )}
                                </li>
                                <li className="list-group-item">
                                    <strong>Статус:</strong>{' '}
                                    {status && (
                                        <span className={`badge ${status.class}`}>
                                            {status.text}
                                        </span>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="d-flex flex-wrap justify-content-between gap-2">
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/olymp-admin/event/index')}
                        >
                            Назад к списку
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={() => navigate(`/olymp-admin/event/prize-score/${event.id}`)}
                        >
                            Перейти к определению баллов
                        </button>

                        <button
                            className="btn btn-success"
                            onClick={async () => {
                                try {
                                    await axios.get(HOSTS['OLYMP_ADMIN'] + `/api/event/synchronize/${event.id}`, {
                                        headers: {
                                            'Authorization': accessToken,
                                            'Content-Type': 'application/json'
                                        },
                                        withCredentials: true
                                    });
                                } catch {

                                }
                            }
                            }
                        >
                            Синхронизировать
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/olymp-admin/event/attendance/${event.id}`)}
                        >
                            Перейти к явкам
                        </button>

                        <button
                            className="btn btn-warning"
                            onClick={() => navigate(`/olymp-admin/event/task/${event.id}`)}
                        >
                            Перейти к заданиям
                        </button>

                        <button
                            className="btn btn-success"
                            onClick={() => navigate(`/olymp-admin/event/point/${event.id}`)}
                        >
                            Перейти к выставлению баллов
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={
                                async () => {
                                    try {
                                        await axios.get(HOSTS['OLYMP_ADMIN'] + `/api/event/publish/${event.id}`, {
                                            headers: {
                                                'Authorization': accessToken,
                                                'Content-Type': 'application/json'
                                            },
                                            withCredentials: true
                                        });
                                    }
                                    catch {
                                    }
                                }
                            }
                        >
                            Опубликовать результаты
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleDelete}
                        >
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventShow;