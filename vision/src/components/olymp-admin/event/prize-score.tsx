import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { HOSTS } from '../../../config/api';
import { useAuth } from '../../Helpers/AuthContext';
interface Event {
  id: string;
  name: string;
}

interface EventScore {
  prize_score: number | string;
  winner_score: number | string;
}

const EventPrizeScoreForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [scores, setScores] = useState<EventScore>({ prize_score: '', winner_score: '' });
  const [loading, setLoading] = useState(true);

  const {accessToken} = useAuth()
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(HOSTS['OLYMP_ADMIN'] + `/api/event/prize-score/${id}`, {
          headers: { Authorization: accessToken },
        });
        setEvent(response.data.event);
        setScores({
          prize_score: response.data.eventScore?.prize_score ?? '',
          winner_score: response.data.eventScore?.winner_score ?? '',
        });
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScores({ ...scores, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        HOSTS['OLYMP_ADMIN'] + `/api/event/set-prize-score/${id}`,
        {
          prize_score: scores.prize_score,
          winner_score: scores.winner_score,
        },
        {
          headers: {
            Authorization: accessToken,
            'Content-Type': 'application/json',
          },
        }
      );
      alert('Баллы успешно сохранены');
      navigate(`/olymp-admin/event/show/${id}`);
    } catch (error) {
      console.error('Ошибка сохранения баллов:', error);
      alert('Не удалось сохранить баллы');
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (!event) return <p>Событие не найдено</p>;

  return (
    <div className="event-prize-score container mt-4">
      <h1>Создание новой заявки</h1>
      <form onSubmit={handleSubmit}>
        <div className="card mb-3">
          <div className="card-header">Минимальное количество баллов для получения статуса призёра</div>
          <div className="card-body">
            <div className="form-group">
              <label>Баллы</label>
              <input
                type="text"
                name="prize_score"
                value={scores.prize_score}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header">Минимальное количество баллов для получения статуса победителя</div>
          <div className="card-body">
            <div className="form-group">
              <label>Баллы</label>
              <input
                type="text"
                name="winner_score"
                value={scores.winner_score}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-success">
          Определить количество баллов
        </button>
      </form>
    </div>
  );
};

export default EventPrizeScoreForm;
