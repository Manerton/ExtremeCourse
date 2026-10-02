import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface ReportIndexProps {}

interface Subject {
  id: number;
  name: string;
}

const ReportIndex: React.FC<ReportIndexProps> = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {accessToken} = useAuth()


  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(HOSTS['OLYMP_ADMIN'] + '/api/report/index', {
          headers: {
            'Authorization': accessToken
          },
          withCredentials: true
        });
        
        console.log('API Response:', response.data);

        // Handle the specific response structure
        let subjectsData: Subject[] = [];
        
        if (response.data?.subjects && typeof response.data.subjects === 'object') {
          // Convert the object to array of subjects
          subjectsData = Object.entries(response.data.subjects).map(([id, name]) => ({
            id: parseInt(id),
            name: String(name)
          }));
        }

        setSubjects(subjectsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setError("Не удалось загрузить список предметов");
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleDownload = async (subjectId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(HOSTS['OLYMP_ADMIN'] + `/api/report/download/${subjectId}`, {
        headers: {
          'Authorization': accessToken
        },
        responseType: 'blob',
        withCredentials: true
      });

      const subject = subjects.find(s => s.id === subjectId);
      const fileName = subject ? `report_${subject.name.replace(/\s+/g, '_')}.xlsx` : 'report.xlsx';

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Не удалось скачать отчет. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
        <p className="text-center mt-2">Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container report-index mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Главная</Link></li>
          <li className="breadcrumb-item active">Отчеты</li>
        </ol>
      </nav>

      <h2 className="mb-4">Отчеты по предметам</h2>
    
      {subjects.length === 0 ? (
        <div className="alert alert-info">
          Нет доступных предметов для формирования отчетов
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th style={{width: '10%'}}>#</th>
                <th style={{width: '70%'}}>Название предмета</th>
                <th style={{width: '20%'}}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={subject.id}>
                  <td>{index + 1}</td>
                  <td>{subject.name}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleDownload(subject.id)}
                      disabled={loading}
                    >
                      {loading ? 'Формирование...' : 'Скачать отчет'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportIndex;