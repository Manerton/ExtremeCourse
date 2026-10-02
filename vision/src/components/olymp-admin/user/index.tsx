import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
}
interface UserResponse {
  users: User[];
  usersAmount: number;
  perPage: number;
}
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

const handleRevoke = async (userId: string, token: string) => {
  if (!window.confirm('Вы уверены, что хотите отозвать токены этого пользователя?')) {
    return;
  }

  try {
    const response = await axios.delete(HOSTS['OLYMP_ADMIN'] + `/api/user/revoke/${userId}`, {
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
      throw new Error('Ошибка при отзыве');
    }
  } catch (error) {
    console.error('Revoke error:', error);
    alert('Не удалось отозвать токены пользователя');
  }
};

const UserIndex: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);
  const navigate = useNavigate();

  const {accessToken} = useAuth()
  

  const fetchUsers = (page: number = 1) => {
    setLoading(true);

    axios.get<UserResponse>(HOSTS['OLYMP_ADMIN'] + `/api/user/index/${page}`, {
      headers: {
        'Authorization': accessToken
      },
      withCredentials: true
    })
      .then(response => {
        setUsers(response.data.users);
        setTotalUsers(response.data.usersAmount);
        setPerPage(response.data.perPage);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch(error => {
        console.error("Ошибка при получении пользователей:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  if (loading) return <p>Загрузка...</p>;

  const totalPages = Math.ceil(totalUsers / perPage);

  return (
    <div className="user-index">
      <h2>Список пользователей</h2>
      <button
        onClick={() => navigate(`/olymp-admin/user/create`)}
        className="btn btn-success"
      >
        Добавить пользователя
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>ФИО</th>
            <th>Эл.почта</th>
            <th>Номер телефона</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{(currentPage - 1) * perPage + index + 1}</td>
              <td>{`${user.firstname || ''} ${user.surname || ''} ${user.patronymic || ''}`.trim()}</td>
              <td>{user.email}</td>
              <td>{user.phone_number}</td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/olymp-admin/user/show/${user.id}`)}
                >
                  Просмотр
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/olymp-admin/user/edit/${user.id}`)}
                >
                  Редактирование
                </button>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => handleRevoke(user.id, accessToken!)}
                >
                  Отозвать токены
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDelete(user.id, accessToken!)}
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

export default UserIndex;