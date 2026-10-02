import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import type { MyEvent } from "../../../types/event.ts";
import CardImage from "./components/CardImage";
import { fetchEvent, fetchStagesCount } from "../../../../requests/EventsRequests";
import { useAuth } from "../../../Helpers/AuthContext.js";
import { UserRole } from "../../../../dictionary/role.js";
import { axiosCreateApplication } from "../../../../requests/ApplicationRequests";
import { subjectsMap } from "../../../../dictionary/subjectDictionary.js";
import { Application } from "../../../types/application.js";

const OlympiadDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [olympiad, setOlympiad] = useState<MyEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stagesCount, setStagesCount] = useState<number | null>(null);

  const { user, accessToken } = useAuth()

  useEffect(() => {
    if (!id) return;

    if (!accessToken) 
      return;

    setLoading(true);

    fetchEvent(accessToken, id)
      .then((res) => setOlympiad(res))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));

    fetchStagesCount(id)
      .then((count) => setStagesCount(count))
      .catch((err) => console.error("Ошибка загрузки этапов:", err));
  }, [id, accessToken]);

  // Отправка заявки через axios
  const handleApply = async () => {
    if (!id) return;

    if (!user) {
      alert("Пожалуйста, войдите в систему, чтобы подать заявку.");
      navigate('/auth');
      return;
    }


    try {
      console.log("Отправка заявки на олимпиаду:", id);

      // TODO: заменить URL и userId на реальные
      // await axiosCreateApplication(accessToken as string, )

      alert("Заявка успешно отправлена!");
    } catch (err) {
      console.error("Ошибка при отправке заявки:", err);
      alert("Ошибка при отправке заявки.");
    }
  };

  // Переход к списку этапов
  const handleGoToStages = () => {
    if (!id) return;
    navigate(`/StagesList/${id}`);
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!olympiad) return <Alert variant="warning">Олимпиада не найдена</Alert>;

  const startDate = new Date(olympiad.start_date).toLocaleDateString();
  const endDate = new Date(olympiad.end_date).toLocaleDateString();


  return (
    <Container className="py-4">
      <Row>
        {/* Левая часть */}
        <Col md={8} className="shadow-sm border-1">
          <CardImage subjectId={olympiad.subject ?? 0} width={800} height={300} />
          <h3 className="fw-bold mt-3">{olympiad.name}</h3>
          <h6 className="text-uppercase text-secondary fw-bold">Описание</h6>
          <p>{olympiad.additional_info}</p>
        </Col>

        {/* Правая карточка */}
        <Col md={4}>
          <Card className="shadow-sm">
            {/* <CardImage subjectId={olympiad.subject ?? 0} width={400} height={150} /> */}
            <Card.Body>
              <Button variant="primary" className="w-100 mb-3" onClick={handleApply}>
                Подать заявку
              </Button>
              <Button variant="secondary" className="w-100 mb-3" onClick={handleGoToStages}>
                Список этапов
              </Button>
              {user?.role === UserRole.Admin && (
                <Button variant="secondary" className="w-100 mb-3" onClick={() => navigate(`/EditEvent/${id}`)}>
                  Редактировать
                </Button>)}

              <p><strong>Дата начала:</strong> {startDate}</p>
              <p><strong>Время:</strong> {endDate}</p>
              {/* <p>
                <strong>Количество этапов:</strong>{" "}
                {stagesCount !== null ? stagesCount : "Загрузка..."}
              </p> */}
              <p><strong>Предмет:</strong> {subjectsMap[olympiad.subject!]}</p>
              {/* <p><strong>Место проведения:</strong> ???</p>  */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OlympiadDetails;
