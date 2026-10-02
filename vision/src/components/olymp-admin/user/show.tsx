import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
const UserShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [roles, setRoles] = useState({});
  const [genders, setGenders] = useState({});
  const [loading, setLoading] = useState(true);

  const {accessToken} = useAuth()
  

  useEffect(() => {
    axios.get(HOSTS['OLYMP_ADMIN'] + `/api/user/show/${id}`, {
      headers: {
        'Authorization': accessToken
      },
      withCredentials: true
    })
      .then(response => {
        setUser(response.data.model);
        setRoles(response.data.roles);
        setGenders(response.data.genders);
        setLoading(false);
      })
      .catch(error => {
        console.error("Ошибка при получении пользователя:", error);
        setLoading(false);
      });
  }, [id, accessToken]);

  const getFullFio = () => {
    return `${user.firstname || ''} ${user.surname || ''} ${user.patronymic || ''}`.trim();
  };

  const handleDelete = async (userId: string, token: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }
    try {
      const response = await axios.delete(HOSTS['OLYMP_ADMIN'] + `/api/user/delete/${userId}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      const navigate = useNavigate();
      if (response.status === 200) {
        navigate("/olymp-admin/user/index");
      } else {
        throw new Error('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Не удалось удалить пользователя');
    }
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="container user-view">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/olymp-admin/user/index">Список пользователей</Link>
          </li>
          <li className="breadcrumb-item active">
            Просмотр пользователя {getFullFio()}
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Просмотр пользователя {getFullFio()}</h1>
        <div>
          <Link
            to={`/olymp-admin/user/edit/${user.id}`}
            className="btn btn-primary me-2"
          >
            Редактировать
          </Link>
          <button
            onClick={() => handleDelete(user.id, accessToken!)}
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
            <th>Email</th>
            <td>{user.email}</td>
          </tr>
          <tr>
            <th>Номер телефона</th>
            <td>{user.phone_number}</td>
          </tr>
          <tr>
            <th>Дата рождения</th>
            <td>{user.birthdate}</td>
          </tr>
          <tr>
            <th>Роль</th>
            <td>{roles[user.role] || 'Не указано'}</td>
          </tr>
          <tr>
            <th>Пол</th>
            <td>{genders[user.gender] || 'Не указано'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserShow;