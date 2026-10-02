import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface Application {
    id: string;
    code: string;
    status: string;
    reason: string;
    user_id: string;
    userAPI: {
        firstname?: string;
        surname?: string;
        patronymic?: string;
    };
    eventAPI: {
        name?: string;
        subject?: string;
    };
}

interface Dictionary {
    [key: string]: string;
}

interface User {
    id: string;
    firstname?: string;
    surname?: string;
    patronymic?: string;
}

interface Event {
    id: string;
    name: string;
    subject?: string;
}

const ApplicationEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        status: '',
        reason: ''
    });
    const [application, setApplication] = useState<Application | null>(null);
    const [statuses, setStatuses] = useState<Dictionary>({});
    const [reasons, setReasons] = useState<Dictionary>({});
    const [subjects, setSubjects] = useState<Dictionary>({});
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const {accessToken} = useAuth()
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(HOSTS['OLYMP_ADMIN'] + `/api/application/edit/${id}`, {
                    headers: { 'Authorization': accessToken }
                });

                const data = response.data;
                setApplication(data.application);
                setStatuses(data.statuses || {});
                setReasons(data.reasons || {});
                setSubjects(data.subjects || {});
                setUsers(Array.isArray(data.users) ? data.users : []);
                setEvents(Array.isArray(data.events) ? data.events : []);
                
                // Set initial form values
                if (data.application) {
                    setFormData({
                        status: data.application.status,
                        reason: data.application.reason
                    });
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching application data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

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
            await axios.put(HOSTS['OLYMP_ADMIN'] + `/api/application/update/${id}`, formData, {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            navigate('/olymp-admin/application/index');
        } catch (error) {
            console.error('Error updating application:', error);
            alert('Не удалось обновить заявку');
        }
    };

    const getFullName = (user?: { firstname?: string; surname?: string; patronymic?: string }) => {
        if (!user) return '';
        return `${user.firstname || ''} ${user.surname || ''} ${user.patronymic || ''}`.trim();
    };

    if (loading) return <div className="text-center mt-4"><p>Загрузка...</p></div>;
    if (!application) return <div className="text-center mt-4"><p>Заявка не найдена</p></div>;

    return (
        <div className="application-edit container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Редактирование заявки #{application.code} {getFullName(application.userAPI)}</h1>
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href="/olymp-admin/application/index">Список заявок</a>
                        </li>
                        <li className="breadcrumb-item active">Редактирование заявки</li>
                    </ol>
                </nav>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card mb-3">
                    <div className="card-header">Основная информация</div>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="status">Статус заявки</label>
                            <select
                                className="form-control"
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите статус</option>
                                {Object.entries(statuses).map(([key, value]) => (
                                    <option key={key} value={key} selected={application.status === key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-header">Информация об участнике</div>
                    <div className="card-body">
                        <div className="form-group">
                            <h2>{getFullName(application.userAPI)}</h2>
                        </div>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-header">Информация о мероприятии</div>
                    <div className="card-body">
                        <h2>
                            {application.eventAPI?.name || ''}
                            {application.eventAPI?.subject && subjects[application.eventAPI.subject] 
                                ? ` ${subjects[application.eventAPI.subject]}` 
                                : ''}
                        </h2>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-header">Причина участия</div>
                    <div className="card-body">
                        <div className="form-group">
                            <select
                                className="form-control"
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите причину</option>
                                {Object.entries(reasons).map(([key, value]) => (
                                    <option key={key} value={key} selected={application.reason === key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-group d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                        Сохранить изменения
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

export default ApplicationEdit;