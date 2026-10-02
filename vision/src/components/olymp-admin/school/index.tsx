import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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

const SchoolIndex: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Dictionary>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalSchools, setTotalSchools] = useState<number>(0);
  const [perPage] = useState<number>(10);
  const navigate = useNavigate();

  const {accessToken} = useAuth()
  

  const fetchSchools = (page: number = 1) => {
    setLoading(true);
    
    axios.get(HOSTS['OLYMP_ADMIN'] + `/api/school/index/${page}`, {
      headers: {
        'Authorization': accessToken
      },
      withCredentials: true
    })
    .then(response => {
      setSchools(response.data.schools);
      setRegions(response.data.regions || {});
      setTotalSchools(response.data.schoolsAmount || 0);
      setCurrentPage(page);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error fetching schools:", error);
      setLoading(false);
    });
  };

  const handleDelete = async (schoolId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту школу?')) {
      return;
    }

    try {
      const response = await axios.delete(HOSTS['OLYMP_ADMIN'] + `/api/school/delete/${schoolId}`, {
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.status === 200) {
        fetchSchools(currentPage); // Refresh the list
      } else {
        throw new Error('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Не удалось удалить школу');
    }
  };

  useEffect(() => {
    fetchSchools(currentPage);
  }, [currentPage]);

  if (loading) return <p>Загрузка...</p>;

  const totalPages = Math.ceil(totalSchools / perPage);

  return (
    <div className="school-index container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Главная</Link>
          </li>
          <li className="breadcrumb-item active">Список школ</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Список школ</h2>
        <Link 
          to="/olymp-admin/school/create" 
          className="btn btn-success"
        >
          Добавить обр. учреждение
        </Link>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Название образовательного учреждения</th>
            <th>Регион</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((school, index) => (
            <tr key={school.id}>
              <td>{(currentPage - 1) * perPage + index + 1}</td>
              <td>{school.name}</td>
              <td>{regions[school.region] || 'Не указан'}</td>
              <td>
                <button 
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => navigate(`/olymp-admin/school/show/${school.id}`)}
                >
                  Просмотр
                </button>
                <button 
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => navigate(`/olymp-admin/school/edit/${school.id}`)}
                >
                  Редактировать
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(school.id)}
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

export default SchoolIndex;