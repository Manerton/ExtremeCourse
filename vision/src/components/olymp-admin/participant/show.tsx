import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface Participant {
  id: string;
  citizenship: string;
  disability: string;
  class: string;
  userAPI: {
    getFullFio?: () => string;
    firstname?: string;
    surname?: string;
    patronymic?: string;
  };
  schoolAPI: {
    name?: string;
  };
}

interface Dictionaries {
  [key: string]: string;
}

const ParticipantShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [countries, setCountries] = useState<Dictionaries>({});
  const [disabilities, setDisabilities] = useState<Dictionaries>({});
  const [classes, setClasses] = useState<Dictionaries>({});
  const [loading, setLoading] = useState(true);
  
  const {accessToken} = useAuth()
  
  useEffect(() => {
    axios.get(HOSTS['OLYMP_ADMIN'] + `/api/participant/show/${id}`, {
      headers: {
        'Authorization': accessToken
      },
      withCredentials: true
    })
      .then(response => {
        setParticipant(response.data.participant);
        setCountries(response.data.countries || {});
        setDisabilities(response.data.disabilities || {});
        setClasses(response.data.classes || {});
        setLoading(false);
      })
      .catch(error => {
        console.error("Ошибка при получении участника:", error);
        setLoading(false);
      });
  }, [id]);

  const getFullFio = () => {
    if (!participant) return '';
    if (participant.userAPI?.getFullFio) {
      return participant.userAPI.getFullFio();
    }
    return `${participant.userAPI?.surname || ''} ${participant.userAPI?.firstname || ''} ${participant.userAPI?.patronymic || ''}`.trim();
  };

  const handleDelete = async () => {
    if (!participant || !window.confirm('Вы уверены, что хотите удалить этого участника?')) {
      return;
    }
    
    try {
      const response = await axios.delete(HOSTS['OLYMP_ADMIN'] + `/api/participant/delete/${participant.id}`, {
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
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

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (!participant) {
    return <p>Участник не найден</p>;
  }

  return (
    <div className="container participant-view mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/olymp-admin/participant/index">Список участников</Link>
          </li>
          <li className="breadcrumb-item active">
            Просмотр участника {getFullFio()}
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Просмотр участника: {getFullFio()}</h1>
        <div>
          <Link 
            to={`/olymp-admin/participant/edit/${participant.id}`} 
            className="btn btn-primary me-2"
          >
            Редактировать
          </Link>
          <button 
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Удалить
          </button>
        </div>
      </div>

      <table className="table table-striped table-bordered">
        <tbody>
          <tr>
            <th>ФИО</th>
            <td>{getFullFio()}</td>
          </tr>
          <tr>
            <th>Гражданство</th>
            <td>{countries[participant.citizenship] || '—'}</td>
          </tr>
          <tr>
            <th>ОВЗ</th>
            <td>{disabilities[participant.disability] || '—'}</td>
          </tr>
          <tr>
            <th>Обр. учреждение</th>
            <td>{participant.schoolAPI?.name || '—'}</td>
          </tr>
          <tr>
            <th>Класс обучения</th>
            <td>{classes[participant.class] || `${participant.class} класс`}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ParticipantShow;