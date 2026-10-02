import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface Participant {
    id: string;
    userAPI: {
    
    };
    citizenship: string;
    disability: string;
    schoolAPI: {
        name: string;
    };
    class: string;
}

interface Countries {
    [key: string]: string;
}

interface Disabilities {
    [key: string]: string;
}

interface ParticipantResponse {
    participants: Participant[];
    participantsAmount: number;
    perPage: number;
    countries: Countries;
    disabilities: Disabilities;
}

const handleDelete = async (participantId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого участника?')) {
        return;
    }

    const {accessToken} = useAuth()

    try {
        const response = await axios.delete(HOSTS['OLYMP_ADMIN'] + `/api/participant/delete/${participantId}`, {
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        const navigate = useNavigate();
        if (response.status === 200) {
            navigate("/olymp-admin/participant/index");
        } else {
            throw new Error('Ошибка при удалении');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Не удалось удалить участника');
    }
};

const ParticipantIndex: React.FC = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [countries, setCountries] = useState<Countries>({});
    const [disabilities, setDisabilities] = useState<Disabilities>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalParticipants, setTotalParticipants] = useState<number>(0);
    const [perPage, setPerPage] = useState<number>(10);
    const navigate = useNavigate();

    const fetchParticipants = (page: number = 1) => {
        setLoading(true);

        const {accessToken} = useAuth()
        
        axios.get<ParticipantResponse>(HOSTS['OLYMP_ADMIN'] + `/api/participant/index/${page}`, {
            headers: {
                'Authorization': accessToken
            },
            withCredentials: true
        })
        .then(response => {
            setParticipants(response.data.participants);
            setCountries(response.data.countries);
            setDisabilities(response.data.disabilities);
            setTotalParticipants(response.data.participantsAmount);
            setPerPage(response.data.perPage);
            setCurrentPage(page);
            setLoading(false);
        })
        .catch(error => {
            console.error("Ошибка при получении участников:", error);
            setLoading(false);
        });
    };
    
    useEffect(() => {
        fetchParticipants(currentPage);
    }, [currentPage]);

    if (loading) return <p>Загрузка...</p>;

    const totalPages = Math.ceil(totalParticipants / perPage);

    return (
        <div className="participant-index">
            <h2>Список участников деятельности</h2>
            <button 
                onClick={() => navigate(`/olymp-admin/participant/create`)}
                className="btn btn-success"
            >
                Добавить участника деятельности
            </button>

            <table className="table table-bordered table-striped mt-3">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ФИО</th>
                        <th>Гражданство</th>
                        <th>ОВЗ</th>
                        <th>Обр. учреждение</th>
                        <th>Класс обучения</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {participants.map((participant, index) => (
                        <tr key={participant.id}>
                            <td>{(currentPage - 1) * perPage + index + 1}</td>
                            <td>{`${participant.userAPI.firstname || ''} ${participant.userAPI.surname || ''} ${participant.userAPI.patronymic || ''}`.trim()}</td>
                            <td>{countries[participant.citizenship] || '—'}</td>
                            <td>{disabilities[participant.disability] || '—'}</td>
                            <td>{participant.schoolAPI.name}</td>
                            <td>{participant.class} класс</td>
                            <td>
                                <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={() => navigate(`/olymp-admin/participant/show/${participant.id}`)}
                                >
                                    Просмотр
                                </button>
                                <button 
                                    className="btn btn-sm btn-warning"
                                    onClick={() => navigate(`/olymp-admin/participant/edit/${participant.id}`)}
                                >
                                    Редактировать
                                </button>
                                <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(participant.id)}
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

export default ParticipantIndex;