// src/pages/JuryAssignPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Button, Spinner, Alert, ListGroup } from "react-bootstrap";
import type { MyEvent } from "../../../types/event.ts";
import { fetchOlympiadStages } from "../../../../requests/EventsRequests";
import { fetchJuryStage, fetchAllJury, CreateJuryStage, DeleteJuryStage } from "../../../../requests/JuryRequests";
import { useAuth } from "../../../Helpers/AuthContext";
import { UserRole } from "../../../../dictionary/role.js";
import { EventType } from "../../../../dictionary/eventType.js";
import { JuryMember } from "../../../types/jury.js";

// helper: находит ближайшее событие в будущем
const findNextEventId = (stage: MyEvent): string | null => {
  const now = new Date();

  // Собираем этап + его дочерние события
  const allEvents = [stage, ...(stage.events ?? [])];

  // Парсим даты и фильтруем только будущие
  const futureEvents = allEvents
    .map((e) => ({
      ...e,
      start: new Date(e.start_date),
    }))
    .filter((e) => e.start >= now);

  if (futureEvents.length === 0) return null;

  // Берём ближайшее
  futureEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
  return futureEvents[0].id!;
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const JuryAssignPage: React.FC = () => {
  const location = useLocation();
  const { state } = location;
  const passedStage = state?.stage as MyEvent | undefined;
  const passedOlympiadId = state?.olympiadId as string | undefined;
  const passedJury = state?.assignedJury as JuryMember[] | undefined;

  const { id: stageId } = useParams(); // id здесь - это stage.id
  const [stage, setStage] = useState<MyEvent | null>(passedStage ?? null);
  const [assignedJury, setAssignedJury] = useState<JuryMember[]>(passedJury ?? []);
  const [originalAssigned, setOriginalAssigned] = useState<JuryMember[]>([]);
  const [allJury, setAllJury] = useState<JuryMember[]>([]);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  // Загружаем жюри для этапа (всегда, чтобы получить актуальные данные)
  useEffect(() => {
    if (!stageId || !accessToken) return;

    setLoading(true);
    fetchJuryStage(accessToken, stageId)
      .then((juryData) => {
        const data = juryData ?? [];
        setAssignedJury(data);
        setOriginalAssigned(data);
      })
      .catch((err) => {
        console.error(`Error fetching jury for stage ${stageId}:`, err);
        setError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [stageId, accessToken]);

  // Загружаем всех доступных жюри
  useEffect(() => {
    if (!accessToken) return;

    fetchAllJury(accessToken,"3")
      .then((data) => {
        setAllJury(data ?? []);
      })
      .catch((err) => {
        console.error("Error fetching all jury:", err);
        setError((err as Error).message);
      });
  }, [accessToken]);

  // Если stage не передан через state, пытаемся загрузить
  useEffect(() => {
    if (stage || !passedOlympiadId || !stageId) return;

    fetchOlympiadStages(passedOlympiadId)
      .then((res) => {
        const foundStage = (res ?? []).find((s: { id: string; }) => s.id === stageId);
        if (foundStage) {
          setStage(foundStage);
        } else {
          setError("Этап не найден");
        }
      })
      .catch((err) => setError((err as Error).message));
  }, [passedOlympiadId, stageId]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!stage) return <Alert variant="warning">Этап не найден</Alert>;

  const nextEventId = findNextEventId(stage);

  const availableFiltered = allJury.filter(
    (member) => !assignedJury.some((assigned) => assigned.user_id === member.user_id)
  );

  const addToAssigned = (member: JuryMember) => {
    if (!member.user_id) return;

    setAssignedJury((prev) => [...prev, member]);

    const id = member.user_id;
    if (!originalAssigned.some((m) => m.user_id === id)) {
      setAddedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
    setRemovedIds((prev) => prev.filter((r) => r !== id));
  };

  const removeFromAssigned = (member: JuryMember) => {
    if (!member.user_id) return;

    setAssignedJury((prev) => prev.filter((m) => m.user_id !== member.user_id));

    const id = member.user_id;
    if (originalAssigned.some((m) => m.user_id === id)) {
      setRemovedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
    setAddedIds((prev) => prev.filter((a) => a !== id));
  };

  const onSave = async () => {
    if (!accessToken || !stageId) return;

    try {
      if (addedIds.length > 0) {
        await CreateJuryStage(accessToken, addedIds, stageId);
      }
      if (removedIds.length > 0) {
        await DeleteJuryStage(accessToken, removedIds, stageId);
      }
      navigate(-1); // Или navigate(`/stages/${passedOlympiadId}`)
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения изменений");
    }
  };

  return (
   <Container className="py-4">
  <h3 className="fw-bold mb-4 text-center">
    Назначение жюри для этапа: {stage.name}
  </h3>
  <Row className="justify-content-center">
    <Col md={12} className="mb-4 text-center">
      <div className="shadow-sm mb-4">
        <div className="d-flex align-items-center gap-3 mt-3 flex-wrap justify-content-center">
          {/* Этап */}
          <div
            className={`p-3 border rounded text-center card-stage ${
              nextEventId === stage.id ? "border-primary border-3 shadow" : ""
            }`}
          >
            <h6 className="fw-bold mb-3">{stage.name}</h6>
            <hr />
            <div className="justify-content-between">
              <div>
                <span className="badge bg-success mb-1">Начало</span>
                <p className="mb-0 fw-semibold">
                  {formatDateTime(stage.start_date)}
                </p>
              </div>
              <div>
                <span className="badge bg-danger mb-1">Конец</span>
                <p className="mb-0 fw-semibold">
                  {formatDateTime(stage.end_date)}
                </p>
              </div>
            </div>
          </div>

          {/* ➝ если есть просмотр */}
          {stage.events?.some((c) => c.event_type === EventType.ViewWorks) && (
            <span className="fs-3">➝</span>
          )}

          {/* Просмотр работ */}
          {stage.events
            ?.filter((c) => c.event_type === EventType.ViewWorks)
            .map((view) => (
              <div
                key={view.id}
                className={`p-3 border rounded text-center card-stage ${
                  nextEventId === view.id ? "border-primary border-3 shadow" : ""
                }`}
              >
                <h6 className="fw-bold mb-3">Просмотр работ</h6>
                <hr />
                <div className="justify-content-between">
                  <div>
                    <span className="badge bg-success mb-1">Начало</span>
                    <p className="mb-0 fw-semibold">
                      {formatDateTime(view.start_date)}
                    </p>
                  </div>
                  <div>
                    <span className="badge bg-danger mb-1">Конец</span>
                    <p className="mb-0 fw-semibold">
                      {formatDateTime(view.end_date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          {/* ➝ если есть апелляция */}
          {stage.events?.some((c) => c.event_type === EventType.Appeal) && (
            <span className="fs-3">➝</span>
          )}

          {/* Апелляция */}
          {stage.events
            ?.filter((c) => c.event_type === EventType.Appeal)
            .map((appeal) => (
              <div
                key={appeal.id}
                className={`p-3 border rounded text-center card-stage ${
                  nextEventId === appeal.id ? "border-primary border-3 shadow" : ""
                }`}
              >
                <h6 className="fw-bold mb-3">Апелляция</h6>
                <hr />
                <div className="justify-content-between">
                  <div>
                    <span className="badge bg-success mb-1">Начало</span>
                    <p className="mb-0 fw-semibold">
                      {formatDateTime(appeal.start_date)}
                    </p>
                  </div>
                  <div>
                    <span className="badge bg-danger mb-1">Конец</span>
                    <p className="mb-0 fw-semibold">
                      {formatDateTime(appeal.end_date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <hr />
    </Col>
  </Row>

      <Row>
        <Col md={6}>
          <h5>Назначенные жюри</h5>
          <ListGroup>
            {assignedJury.map((member, idx) => (
              <ListGroup.Item key={member.id || idx} className="d-flex justify-content-between align-items-center">
                <span>
                  <strong>{member.name}</strong>
                </span>
                {user?.role === UserRole.Admin && (
                  <Button variant="danger" size="sm" onClick={() => removeFromAssigned(member)}>
                    Удалить
                  </Button>
                )}
              </ListGroup.Item>
            ))}
            {assignedJury.length === 0 && <ListGroup.Item>Жюри не назначено</ListGroup.Item>}
          </ListGroup>
        </Col>
        <Col md={6}>
          <h5>Доступные жюри</h5>
          <ListGroup>
            {availableFiltered.map((member, idx) => (
              <ListGroup.Item key={member.id || idx} className="d-flex justify-content-between align-items-center">
                <span>
                  <strong>{member.name}</strong>
                </span>
                {user?.role === UserRole.Admin && (
                  <Button variant="success" size="sm" onClick={() => addToAssigned(member)}>
                    Добавить
                  </Button>
                )}
              </ListGroup.Item>
            ))}
            {availableFiltered.length === 0 && <ListGroup.Item>Нет доступных</ListGroup.Item>}
          </ListGroup>
        </Col>
      </Row>
      {user?.role === UserRole.Admin && (
        <>
          <Button variant="primary" className="mt-4" onClick={onSave}>
            Сохранить изменения
          </Button>
          <Button variant="secondary" className="mt-4 ms-2" onClick={() => navigate(-1)}>
            Отмена
          </Button>
        </>
      )}
    </Container>
  );
};

export default JuryAssignPage;