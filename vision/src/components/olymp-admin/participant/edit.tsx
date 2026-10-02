import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface Dictionary {
  [key: string]: string;
}

interface School {
  id: string;
  name: string;
}

interface FormData {
  email: string;
  password: string;
  surname: string;
  firstname: string;
  patronymic: string;
  phone_number: string;
  gender: string;
  role: string;
  birthdate: string;
  disability: string;
  class_number: string;
  citizenship: string;
  school_id: string;
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
  disability?: string;
  class_number?: string;
  citizenship?: string;
  school_id?: string;
}

const ParticipantEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    surname: '',
    firstname: '',
    patronymic: '',
    phone_number: '',
    gender: '1',
    role: '1',
    birthdate: '',
    disability: '1',
    class_number: '9',
    citizenship: '1',
    school_id: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [dictionaries, setDictionaries] = useState({
    genders: {} as Dictionary,
    roles: {} as Dictionary,
    disabilities: {} as Dictionary,
    classes: {} as Dictionary,
    countries: {} as Dictionary,
    schools: [] as School[]
  });

  const {accessToken} = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [participantResponse] = await Promise.all([
          axios.get(HOSTS['OLYMP_ADMIN'] + `/api/participant/edit/${id}`, {
            headers: { 'Authorization': accessToken },
            withCredentials: true
          }),
        ]);

        const participant = participantResponse.data.participant;
        const user = participant.userAPI || {};
        
        setDictionaries({
          genders: participantResponse.data.genders || {},
          roles: participantResponse.data.roles || {},
          disabilities: participantResponse.data.disabilities || {},
          classes: participantResponse.data.classes || {},
          countries: participantResponse.data.countries || {},
          schools: participantResponse.data.schools || []
        });

        setFormData({
          email: user.email || '',
          password: '',
          surname: user.surname || '',
          firstname: user.firstname || '',
          patronymic: user.patronymic || '',
          phone_number: user.phone_number || '',
          gender: (user.gender || '1').toString(),
          role: (user.role || '1').toString(),
          birthdate: user.birthdate || '',
          disability: (participant.disability || '1').toString(),
          class_number: (participant.class || '9').toString(),
          citizenship: (participant.citizenship || '1').toString(),
          school_id: participant.school_id || (participantResponse.data.schools[0]?.id || '')
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
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        password: formData.password || undefined
      };

      const response = await axios.put(
        HOSTS['OLYMP_ADMIN'] + `/api/participant/update/${id}`, 
        dataToSend, 
        {
          headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        navigate('/olymp-admin/participant/index');
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error updating participant:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/olymp-admin/participant/index">Список участников</Link>
          </li>
          <li className="breadcrumb-item active">Редактирование участника</li>
        </ol>
      </nav>

      <h1 className="mb-4">Редактировать участника</h1>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email (логин)</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={255}
                required
                disabled
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
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

            <div className="mb-3">
              <label htmlFor="surname" className="form-label">Фамилия</label>
              <input
                type="text"
                className={`form-control ${errors.surname ? 'is-invalid' : ''}`}
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                maxLength={255}
                required
              />
              {errors.surname && <div className="invalid-feedback">{errors.surname}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="firstname" className="form-label">Имя</label>
              <input
                type="text"
                className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                maxLength={255}
                required
              />
              {errors.firstname && <div className="invalid-feedback">{errors.firstname}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="patronymic" className="form-label">Отчество</label>
              <input
                type="text"
                className={`form-control ${errors.patronymic ? 'is-invalid' : ''}`}
                id="patronymic"
                name="patronymic"
                value={formData.patronymic}
                onChange={handleChange}
                maxLength={255}
              />
              {errors.patronymic && <div className="invalid-feedback">{errors.patronymic}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="phone_number" className="form-label">Телефон</label>
              <input
                type="tel"
                className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
              {errors.phone_number && <div className="invalid-feedback">{errors.phone_number}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="gender" className="form-label">Пол</label>
              <select
                className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                {Object.entries(dictionaries.genders).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="role" className="form-label">Роль</label>
              <select
                className={`form-control ${errors.role ? 'is-invalid' : ''}`}
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                {Object.entries(dictionaries.roles).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {errors.role && <div className="invalid-feedback">{errors.role}</div>}
            </div>

            <div className="mb-3">
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

            <div className="mb-3">
              <label htmlFor="disability" className="form-label">Ограничения по здоровью</label>
              <select
                name="disability"
                id="disability"
                className={`form-control ${errors.disability ? 'is-invalid' : ''}`}
                value={formData.disability}
                onChange={handleChange}
              >
                {Object.entries(dictionaries.disabilities).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {errors.disability && <div className="invalid-feedback">{errors.disability}</div>}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="class_number" className="form-label">Класс обучения</label>
              <select
                name="class_number"
                id="class_number"
                className={`form-control ${errors.class_number ? 'is-invalid' : ''}`}
                value={formData.class_number}
                onChange={handleChange}
              >
                {Object.entries(dictionaries.classes).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {errors.class_number && <div className="invalid-feedback">{errors.class_number}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="citizenship" className="form-label">Гражданство</label>
              <select
                name="citizenship"
                id="citizenship"
                className={`form-control ${errors.citizenship ? 'is-invalid' : ''}`}
                value={formData.citizenship}
                onChange={handleChange}
              >
                {Object.entries(dictionaries.countries).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {errors.citizenship && <div className="invalid-feedback">{errors.citizenship}</div>}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="school_id" className="form-label">Школа</label>
          <select
            name="school_id"
            id="school_id"
            className={`form-control ${errors.school_id ? 'is-invalid' : ''}`}
            value={formData.school_id}
            onChange={handleChange}
          >
            {dictionaries.schools.map(school => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
          {errors.school_id && <div className="invalid-feedback">{errors.school_id}</div>}
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="button" className="btn btn-secondary me-2" onClick={() => navigate(-1)}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary">
            Сохранить изменения
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParticipantEdit;