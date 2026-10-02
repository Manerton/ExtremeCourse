import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext.js';
interface School {
  id: string;
  name: string;
  region: string;
}

interface Dictionary {
  [key: string]: string;
}

const SchoolShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [regions, setRegions] = useState<Dictionary>({});
  const [loading, setLoading] = useState<boolean>(true);

  const {accessToken} = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(HOSTS['OLYMP_ADMIN'] + `/api/school/show/${id}`, {
          headers: {
            'Authorization': accessToken
          },
          withCredentials: true
        });

        setSchool(response.data.school);
        setRegions(response.data.regions || {});
        setLoading(false);
      } catch (error) {
        console.error("Error fetching school:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!school || !window.confirm('Вы уверены, что хотите удалить это образовательное учреждение?')) {
      return;
    }

    try {
      const response = await axios.delete(HOSTS['OLYMP_ADMIN'] + `/api/school/delete/${school.id}`, {
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.status === 200) {
        navigate("/olymp-admin/school/index");
      } else {
        throw new Error('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Не удалось удалить образовательное учреждение');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  if (!school) {
    return <div className="text-center mt-5">Образовательное учреждение не найдено</div>;
  }

  return (
    <div className="container school-view mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Главная</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/olymp-admin/school/index">Список обр. учреждений</Link>
          </li>
          <li className="breadcrumb-item active">Просмотр: {school.name}</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Просмотр образовательного учреждения {school.name}</h1>
        <div>
          <Link 
            to={`/olymp-admin/school/edit/${school.id}`} 
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
            <th>Название образовательного учреждения</th>
            <td>{school.name}</td>
          </tr>
          <tr>
            <th>Регион</th>
            <td>{regions[school.region] || 'Не указан'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SchoolShow;