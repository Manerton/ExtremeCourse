import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form, Button, Container, Alert } from "react-bootstrap";
import type { MyEvent } from "../../../types/event";
import { EventType } from "../../../../dictionary/eventType";
import { axiosUpdateEvent, fetchEvent } from "../../../../requests/EventsRequests";
import { useAuth } from "../../../Helpers/AuthContext";

// пока моки для примера
const mockEvent: MyEvent = {
  id: "1",
  name: "Этап 1 Класс 9 История",
  start_date: "2025-09-02T10:00:00Z",
  end_date: "2025-09-02T12:00:00Z",
  previous_event_id: "0",
  event_type: EventType.Stage,
  subject: 1,
  class_number: 9,
  additional_info: "Аудитория 205",
  events: [],
};

const EditEventPage: React.FC = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<MyEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {

    if (!id) return;
    setLoading(true);

    const getEvent = async () => {
      try {
        const result = await fetchEvent(id)

        setEvent(result);
      } catch (err) {
        setError("Ошибка загрузки события");
      } finally {
        setLoading(false);
      }
    }

    getEvent()
  }, [id]);

  const handleChange = (field: keyof MyEvent, value: any) => {
    if (!event) return;
    setEvent({ ...event, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    console.log("Сохраняем:", event);

    try {
      await axiosUpdateEvent(accessToken!, event);
      alert("Событие обновлено");
    }
    catch (err) {
      console.error("Ошибка обновления события", err);
      alert("Ошибка обновления события");
    }
    // TODO: запрос PUT/PATCH на бэк
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!event) return <Alert variant="warning">Событие не найдено</Alert>;

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-4">Редактирование события</h3>
      <Form onSubmit={handleSubmit}>
        {/* name */}
        <Form.Group className="mb-3">
          <Form.Label>Название</Form.Label>
          <Form.Control
            type="text"
            value={event.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </Form.Group>

        {/* start_date */}
        <Form.Group className="mb-3">
          <Form.Label>Дата начала</Form.Label>
          <Form.Control
            type="datetime-local"
            value={event.start_date.slice(0, 16)} // ISO → YYYY-MM-DDTHH:mm
            onChange={(e) => handleChange("start_date", e.target.value)}
          />
        </Form.Group>

        {/* end_date */}
        <Form.Group className="mb-3">
          <Form.Label>Дата окончания</Form.Label>
          <Form.Control
            type="datetime-local"
            value={event.end_date.slice(0, 16)}
            onChange={(e) => handleChange("end_date", e.target.value)}
          />
        </Form.Group>

        {/* additional_info */}
        <Form.Group className="mb-3">
          <Form.Label>Доп. информация</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={event.additional_info ?? ""}
            onChange={(e) => handleChange("additional_info", e.target.value)}
          />
        </Form.Group>

        {/* class_number — только для Stage */}
        {event.event_type === EventType.Stage && (
          <Form.Group className="mb-3">
            <Form.Label>Класс</Form.Label>
            <Form.Control
              type="number"
              value={event.class_number ?? ""}
              onChange={(e) => handleChange("class_number", Number(e.target.value))}
            />
          </Form.Group>
        )}

        {/* не редактируемые поля */}
        <Form.Group className="mb-3">
          <Form.Label>Тип события</Form.Label>
          <Form.Control type="text" value={event.event_type} disabled />
        </Form.Group>

        <Button variant="primary" type="submit">
          Сохранить
        </Button>
      </Form>
    </Container>
  );
};

export default EditEventPage;
