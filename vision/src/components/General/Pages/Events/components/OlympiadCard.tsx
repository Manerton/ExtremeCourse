import { useEffect, useState } from 'react';
import { Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import type { MyEvent } from '../../../../types/event.ts';
import CardImage from './CardImage';
import { fetchOlympiadAvailableClassEvents, fetchOlympiadChild } from '../../../../../requests/EventsRequests';
import { useAuth } from '../../../../Helpers/AuthContext.js';
import { UserRole } from '../../../../../dictionary/role.js';

const OlympiadCard: React.FC<{ olympiad: MyEvent; onClick?: (id: string) => void }> = ({ olympiad, onClick }) => {
  const [children, setChildren] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const { accessToken, user } = useAuth()

  useEffect(() => {
    if (!olympiad.id) return;

    setLoading(true);
    if (user != null && user.role === UserRole.Participant) {
      fetchOlympiadAvailableClassEvents(accessToken!, olympiad.id.toString())
        .then(setChildren)
        .finally(() => setLoading(false));
    } else {
      fetchOlympiadChild(accessToken!, olympiad.id.toString())
        .then(setChildren)
        .finally(() => setLoading(false));
    }

  }, [olympiad.id]);

  const startDate = new Date(olympiad.start_date).toLocaleDateString();
  const endDate = new Date(olympiad.end_date).toLocaleDateString();

  return (
    <Card className="mb-3 shadow-sm">
      <CardImage subjectId={olympiad.subject ?? 0} width={300} height={200} />
      <Card.Body className="d-flex flex-column justify-content-between">
        <div className="flex-grow-1">
          <Card.Title className="text-justify">{olympiad.name}</Card.Title>
          <Card.Text className="text-justify">
            <strong>Дата начала:</strong> {startDate} <br />
            <strong>Дата окончания:</strong> {endDate} <br />
          </Card.Text>
        </div>

        {/* Кнопка "Подробнее" снизу */}
        {/* {onClick && (
        <Button variant="primary" onClick={() => onClick(olympiad.id!)} className="w-100 mt-2">
          Открыть подробную информацию
        </Button>
      )} */}
        <hr />
        {/* Кнопки по классам */}
        <div className="d-flex flex-wrap justify-content-between gap-2">
          {loading && <Spinner size="sm" />}
          {!loading && [...children].sort((a, b) => (a.class_number ?? 0) - (b.class_number ?? 0)) // сортировка по возрастанию
            .map(child => (
              <Button
                key={child.id}
                variant="outline-primary"
                onClick={() => onClick?.(child.id!)}
                className="flex-fill"
              >
                {child.class_number} класс
              </Button>
            ))}
        </div>
      </Card.Body>

    </Card>
  );
};

export default OlympiadCard;
