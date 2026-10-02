import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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

interface FormErrors {
  name?: string;
  region?: string;
}

const SchoolEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<School>({
    id: '',
    name: '',
    region: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [regions, setRegions] = useState<Dictionary>({});
  const [loading, setLoading] = useState(true);

  const {accessToken} = useAuth()
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolResponse] = await Promise.all([
          axios.get(HOSTS['OLYMP_ADMIN'] + `/api/school/edit/${id}`, {
            headers: { 'Authorization': accessToken },
            withCredentials: true
          })
        ]);

        setRegions(schoolResponse.data.regions || {});
        setFormData({
          id: schoolResponse.data.school.id,
          name: schoolResponse.data.school.name,
          region: schoolResponse.data.school.region
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
      await axios.put(HOSTS['OLYMP_ADMIN'] + `/api/school/update/${id}`, formData, {
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      navigate('/olymp-admin/school/index');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error updating school:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  return (
    <div className="container mt-4">
      <form onSubmit={handleSubmit} id="dynamic-form">
        <div className="form-group mb-3">
          <label htmlFor="name" className="form-label">Название образовательного учреждения</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={255}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="region" className="form-label">Регион</label>
          <select
            className={`form-control ${errors.region ? 'is-invalid' : ''}`}
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
          >
            {Object.entries(regions).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
          {errors.region && <div className="invalid-feedback">{errors.region}</div>}
        </div>

        <button type="submit" className="btn btn-primary">Обновить</button>
      </form>
    </div>
  );
};

export default SchoolEdit;