import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext.js';
interface Dictionary {
  [key: string]: string; // Ключи также должны быть строками
}

interface FormData {
  email: string;
  password: string;
  surname: string;
  firstname: string;
  patronymic: string;
  phone_number: string;
  gender: string; // изменено на string
  role: string;   // изменено на string
  birthdate: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  surname?: string;
  firstname?: string;
  patronymic?: string;
  phone_number?: string;
  gender?: string;
  role?: string;
  birthdate?: string;
}

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Dictionary>({});
  const [genders, setGenders] = useState<Dictionary>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    surname: '',
    firstname: '',
    patronymic: '',
    phone_number: '',
    gender: '1', // строка вместо числа
    role: '1',   // строка вместо числа
    birthdate: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const {accessToken} = useAuth()
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dictionariesResponse, userResponse] = await Promise.all([
          axios.get(HOSTS['OLYMP_ADMIN'] + '/api/user/create', {
            headers: { 'Authorization': accessToken },
            withCredentials: true
          }),
          axios.get(HOSTS['OLYMP_ADMIN'] + `/api/user/show/${id}`, {
            headers: { 'Authorization': accessToken },
            withCredentials: true
          })
        ]);

        setRoles(dictionariesResponse.data.roles);
        setGenders(dictionariesResponse.data.genders);

        const user = userResponse.data.model;
        setFormData({
          email: user.email,
          password: '', 
          surname: user.surname,
          firstname: user.firstname,
          patronymic: user.patronymic || '',
          phone_number: user.phone_number || '',
          gender: (user.gender || 1).toString(), // преобразуем в строку
          role: (user.role || 1).toString(),     // преобразуем в строку
          birthdate: user.birthdate || ''
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value // больше не преобразуем в число
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        password: formData.password || undefined
      };

      const response = await axios.put(HOSTS['OLYMP_ADMIN'] + `/api/user/update/${id}`, dataToSend, {
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      navigate('/olymp-admin/user/index');
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error updating user:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  return (
    <div className="container user-form mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/olymp-admin/user/index">Список пользователей</Link>
          </li>
          <li className="breadcrumb-item active">Редактирование пользователя</li>
        </ol>
      </nav>

      <h1 className="mb-4">Редактирование пользователя</h1>

      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group mb-3">
              <label htmlFor="email" className="form-label">Email (логин)</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="password" className="form-label">Новый пароль</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Оставьте пустым, если не нужно менять"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="surname" className="form-label">Фамилия</label>
              <input
                type="text"
                className={`form-control ${errors.surname ? 'is-invalid' : ''}`}
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
              />
              {errors.surname && <div className="invalid-feedback">{errors.surname}</div>}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="firstname" className="form-label">Имя</label>
              <input
                type="text"
                className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
              {errors.firstname && <div className="invalid-feedback">{errors.firstname}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group mb-3">
              <label htmlFor="patronymic" className="form-label">Отчество</label>
              <input
                type="text"
                className={`form-control ${errors.patronymic ? 'is-invalid' : ''}`}
                id="patronymic"
                name="patronymic"
                value={formData.patronymic}
                onChange={handleChange}
              />
              {errors.patronymic && <div className="invalid-feedback">{errors.patronymic}</div>}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="phone_number" className="form-label">Телефон</label>
              <input
                type="tel"
                className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+7 999 999-99-99"
              />
              {errors.phone_number && <div className="invalid-feedback">{errors.phone_number}</div>}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="gender" className="form-label">Пол</label>
              <select
                className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                {Object.entries(genders).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="role" className="form-label">Роль</label>
              <select
                className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                {Object.entries(roles).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {errors.role && <div className="invalid-feedback">{errors.role}</div>}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="birthdate" className="form-label">Дата рождения</label>
              <input
                type="date"
                className={`form-control ${errors.birthdate ? 'is-invalid' : ''}`}
                id="birthdate"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              {errors.birthdate && <div className="invalid-feedback">{errors.birthdate}</div>}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="button" className="btn btn-secondary me-2" onClick={() => navigate(-1)}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary px-4">
            Сохранить изменения
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;