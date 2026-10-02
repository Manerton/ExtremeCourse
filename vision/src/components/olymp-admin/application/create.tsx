import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface User {
    id: string;
    firstname?: string;
    surname?: string;
    patronymic?: string;
}

interface Event {
    id: string;
    name: string;
}

interface Status {
    [key: string]: string; // Dictionary format: { "1": "Awaiting", "2": "Confirmed" }
}

const ApplicationCreate: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [statuses, setStatuses] = useState<Status>({});
    const [formData, setFormData] = useState({
        user_id: '',
        event_id: '',
        status: ''
    });
    const [loading, setLoading] = useState(true);

    const {accessToken} = useAuth()


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(HOSTS['OLYMP_ADMIN'] + '/api/application/create', {
                    headers: { 'Authorization': accessToken }
                });

                // Adjust data structure based on your controller response
                setStatuses(response.data.statuses || {});
                setUsers(response.data.users?.[0] || []); // Extract array from nested array
                setEvents(response.data.events || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(HOSTS['OLYMP_ADMIN'] + '/api/application/store', formData, {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            navigate('/olymp-admin/application/index');
        } catch (error) {
            console.error('Error creating application:', error);
            alert('Не удалось создать заявку');
        }
    };

    if (loading) return <div className="text-center mt-4"><p>Загрузка...</p></div>;

    const getFullName = (user: User) => {
        return `${user.firstname || ''} ${user.surname || ''} ${user.patronymic || ''}`.trim();
    };

    return (
        <div className="application-create container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Создание новой заявки</h1>
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href="/olymp-admin/application/index">Список заявок</a>
                        </li>
                        <li className="breadcrumb-item active">Создание заявки</li>
                    </ol>
                </nav>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card mb-3">
                    <div className="card-header">Выбор участника</div>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="user_id">Участник</label>
                            <select
                                className="form-control"
                                id="user_id"
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите участника</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {getFullName(user)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-header">Выбор мероприятия</div>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="event_id">Мероприятие</label>
                            <select
                                className="form-control"
                                id="event_id"
                                name="event_id"
                                value={formData.event_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите мероприятие</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>
                                        {event.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-header">Статус</div>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="status">Статус</label>
                            <select
                                className="form-control"
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите статус</option>
                                {Object.entries(statuses).map(([id, name]) => (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-group d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                        Создать заявку
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => navigate('/olymp-admin/application/index')}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ApplicationCreate;