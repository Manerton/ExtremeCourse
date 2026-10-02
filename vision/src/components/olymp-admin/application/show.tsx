import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface Application {
    id: string;
    code: string;
    status: string;
    reason?: string;
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

interface Statuses {
    [key: string]: string;
}

const ApplicationShow: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [application, setApplication] = useState<Application | null>(null);
    const [statuses, setStatuses] = useState<Statuses>({});
    const [loading, setLoading] = useState(true);

    const {accessToken} = useAuth()
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(HOSTS['OLYMP_ADMIN'] +`/api/application/show/${id}`, {
                    headers: { 'Authorization': accessToken }
                });

                setApplication(response.data.application);
                setStatuses(response.data.statuses);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching application:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const getFullName = () => {
        if (!application?.userAPI) return '';
        const { firstname, surname, patronymic } = application.userAPI;
        return `${firstname || ''} ${surname || ''} ${patronymic || ''}`.trim();
    };

    if (loading) return <div className="text-center mt-4"><p>Загрузка...</p></div>;
    if (!application) return <div className="text-center mt-4"><p>Заявка не найдена</p></div>;

    return (
        <div className="application-show container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Детали заявки #{application.code}</h1>
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href="/olymp-admin/application/index">Список заявок</a>
                        </li>
                        <li className="breadcrumb-item active">Просмотр заявки</li>
                    </ol>
                </nav>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h5>Основная информация</h5>
                            <p><strong>Код заявки:</strong> {application.code}</p>
                            <p><strong>Статус:</strong> {statuses[application.status] || application.status}</p>
                        </div>
                        <div className="col-md-6">
                            <h5>Участник</h5>
                            <p><strong>ФИО:</strong> {getFullName()}</p>
                        </div>
                    </div>

                    <hr />

                    <div className="row mt-3">
                        <div className="col-md-6">
                            <h5>Мероприятие</h5>
                            <p><strong>Название:</strong> {application.eventAPI?.name || '—'}</p>
                            {application.eventAPI?.subject && (
                                <p><strong>Предмет:</strong> {application.eventAPI.subject}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 d-flex gap-2">
                <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/olymp-admin/application/index')}
                >
                    Назад к списку
                </button>
                <button 
                    className="btn btn-warning"
                    onClick={() => navigate(`/olymp-admin/application/edit/${application.id}`)}
                >
                    Редактировать
                </button>
            </div>
        </div>
    );
};

export default ApplicationShow;