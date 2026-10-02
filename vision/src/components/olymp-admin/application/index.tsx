import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface Application {
    id: string;
    code: string;
    status: string;
    userAPI: {
        firstname: string;
        surname: string;
        patronymic: string;
    };
    eventAPI: {
        name: string;
        subject: string;
    };
}

interface Dictionaries {
    [key: string]: string;
}

interface ApplicationResponse {
    applications: Application[];
    applicationsAmount: number;
    perPage: number;
    subjects: Dictionaries;
    statuses: Dictionaries;
}

const ApplicationIndex: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [subjects, setSubjects] = useState<Dictionaries>({});
    const [statuses, setStatuses] = useState<Dictionaries>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalApplications, setTotalApplications] = useState<number>(0);
    const [perPage, setPerPage] = useState<number>(10);
    const navigate = useNavigate();

    const {accessToken} = useAuth()
    

    const fetchApplications = (page: number = 1) => {
        setLoading(true);
        axios.get<ApplicationResponse>(HOSTS['OLYMP_ADMIN'] + `/api/application/index/${page}`, {
            headers: {
                'Authorization': accessToken
            },
            withCredentials: true
        })
        .then(response => {
            setApplications(response.data.applications);
            setSubjects(response.data.subjects);
            setStatuses(response.data.statuses);
            setTotalApplications(response.data.applicationsAmount);
            setPerPage(response.data.perPage);
            setCurrentPage(page);
            setLoading(false);
        })
        .catch(error => {
            console.error("Ошибка при получении заявок:", error);
            setLoading(false);
        });
    };

    const handleConfirm = async (applicationId: string) => {
        try {
            await axios.post(HOSTS['OLYMP_ADMIN'] + `/api/application/confirm/${applicationId}`, {}, {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            fetchApplications(currentPage);
        } catch (error) {
            console.error('Confirm error:', error);
            alert('Не удалось подтвердить заявку');
        }
    };

    const handleReject = async (applicationId: string) => {
        try {
            await axios.post(HOSTS['OLYMP_ADMIN'] + `/api/application/reject/${applicationId}`, {}, {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            fetchApplications(currentPage);
        } catch (error) {
            console.error('Reject error:', error);
            alert('Не удалось отклонить заявку');
        }
    };

    const handleDelete = async (applicationId: string) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
            return;
        }
        try {
            await axios.delete(HOSTS['OLYMP_ADMIN'] + `/api/application/delete/${applicationId}`, {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            fetchApplications(currentPage);
        } catch (error) {
            console.error('Delete error:', error);
            alert('Не удалось удалить заявку');
        }
    };

    useEffect(() => {
        fetchApplications(currentPage);
    }, [currentPage]);

    if (loading) return <p>Загрузка...</p>;

    const totalPages = Math.ceil(totalApplications / perPage);

    return (
        <div className="application-index">
            <h2>Список заявок</h2>
            
            <table className="table table-bordered table-striped mt-3">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Код заявки</th>
                        <th>ФИО участника</th>
                        <th>Предмет</th>
                        <th>Статус заявки</th>
                        <th>Изменения статуса заявки</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((application, index) => (
                        <tr key={application.id}>
                            <td>{(currentPage - 1) * perPage + index + 1}</td>
                            <td>{application.code}</td>
                            <td>
                                {
                                    `${application.userAPI.firstname || ''} ${application.userAPI.surname || ''} ${application.userAPI.patronymic || ''}`.trim()
                                }
                            </td>
                            <td>{`${application.eventAPI.name} ${subjects[application.eventAPI.subject] || ''}`.trim()}</td>
                            <td>{statuses[application.status] || '—'}</td>
                            <td>
                                {application.status == '1'&& (
                                    <>
                                        <button 
                                            className="btn btn-sm btn-success me-2"
                                            onClick={() => handleConfirm(application.id)}
                                        >
                                            Подтвердить заявку
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleReject(application.id)}
                                        >
                                            Отклонить заявку
                                        </button>
                                    </>
                                )}
                            </td>
                            <td>
                                <button 
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => navigate(`/olymp-admin/application/show/${application.id}`)}
                                >
                                    Просмотр
                                </button>
                                <button 
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => navigate(`/olymp-admin/application/edit/${application.id}`)}
                                >
                                    Редактировать
                                </button>
                                <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(application.id)}
                                >
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-light'}`}
                        onClick={() => setCurrentPage(page)}
                        disabled={currentPage === page}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ApplicationIndex;