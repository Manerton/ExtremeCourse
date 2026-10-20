import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Alert, Badge, Card, Row, Col, Spinner } from "react-bootstrap";
import { BsCheckCircleFill, BsExclamationTriangleFill } from "react-icons/bs";
import { useAuth } from "../../Helpers/AuthContext";
import { HomeworkDetailDTO } from "../../types/homework";
import { axiosGetHomeworkById, axiosSubmitHomework } from "../../../requests/HomeworkRequests";
import { parseTaskDescription } from "../../../utils/taskDescriptionParser";

interface TestingModalProps {
    show: boolean;
    onHide: () => void;
    homeworkId: string;
    eventName: string;
    onCompleted?: () => void;
}

const TestingModal: React.FC<TestingModalProps> = ({
                                                       show,
                                                       onHide,
                                                       homeworkId,
                                                       eventName,
                                                       onCompleted,
                                                   }) => {
    const { accessToken, user } = useAuth();

    const [homework, setHomework] = useState<HomeworkDetailDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ответы пользователя: { [taskId]: "1 3 5" }
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submittedSuccess, setSubmittedSuccess] = useState(false);

    // Загрузка теста при открытии
    useEffect(() => {
        if (!show || !homeworkId || !accessToken) return;

        setLoading(true);
        setError(null);
        setSubmittedSuccess(false);
        setAnswers({});

        axiosGetHomeworkById(accessToken, homeworkId)
            .then((data) => {
                setHomework(data);
            })
            .catch((err) => {
                console.error("Ошибка загрузки теста:", err);
                setError(err.response?.data?.message || err.message || "Не удалось загрузить задания теста");
            })
            .finally(() => setLoading(false));
    }, [show, homeworkId, accessToken]);

    const handleAnswerChange = (taskId: string, val: string) => {
        // Запрещаем знаки препинания по правилам турнира (разрешены буквы, цифры и пробел)
        const cleaned = val.replace(/[,.;:\-_+=/\\|*()]/g, "");
        setAnswers((prev) => ({ ...prev, [taskId]: cleaned }));
    };

    const isAllAnswered = useMemo(() => {
        if (!homework?.tasks?.length) return false;
        return homework.tasks.every((t) => answers[t.id] && answers[t.id].trim().length > 0);
    }, [homework, answers]);

    const handleSubmit = async () => {
        if (!accessToken || !user || !homework) return;

        setSubmitting(true);
        setError(null);

        const payload = {
            answers: Object.entries(answers).map(([taskId, ans]) => ({
                task_id: taskId,
                answer: ans.trim(),
            })),
        };

        try {
            await axiosSubmitHomework(accessToken, homework.id, user.id, payload);
            setSubmittedSuccess(true);
            if (onCompleted) onCompleted();
        } catch (err: any) {
            console.error("Ошибка отправки теста:", err);
            setError(err.response?.data?.message || err.message || "Ошибка при отправке ответов");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setAnswers({});
        setSubmittedSuccess(false);
        setError(null);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton className="bg-light">
                <div>
                    <Modal.Title className="h5 mb-1">
                        {homework?.name || "Входное тестирование"}
                    </Modal.Title>
                    <small className="text-muted">{eventName}</small>
                </div>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: "72vh", overflowY: "auto" }}>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <div className="mt-2 text-muted">Загрузка вопросов...</div>
                    </div>
                ) : error && !homework ? (
                    <Alert variant="danger">{error}</Alert>
                ) : submittedSuccess ? (
                    <div className="text-center py-5">
                        <BsCheckCircleFill className="text-success mb-3" size={54} />
                        <h4 className="fw-bold mb-2">Ответы успешно отправлены!</h4>
                        <p className="text-muted">
                            Ваше тестирование сохранено и передано на проверку организаторам.
                        </p>
                    </div>
                ) : (
                    <>
                        <Alert variant="danger" className="small py-2 mb-3">
                            <strong>Правила записи ответа:</strong>
                            <ul className="mb-0 ps-3 mt-1">
                                <li>Ответ: одна цифра, цифры через пробел или пары «буква-цифра».</li>
                                <li>Знаки препинания (запятые, точки, дефисы) не используются.</li>
                                <li>Разделитель - один пробел (например: <code>1</code>, <code>1 2 3</code>, <code>А1 Б2 В3</code>).</li>
                            </ul>
                        </Alert>

                        {error && (
                            <Alert variant="danger" className="py-2 small">
                                <BsExclamationTriangleFill className="me-2" />
                                {error}
                            </Alert>
                        )}

                        <div className="d-flex flex-column gap-3">
                            {homework?.tasks?.map((task, index) => {
                                const parsed = parseTaskDescription(task.description);

                                return (
                                    <Card key={task.id} className="border shadow-none">
                                        <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Badge bg="secondary">
                                                    {task.name || `Задание №${index + 1}`}
                                                </Badge>
                                                <span className="small text-muted">
                                                    Макс. балл: {task.max_points}
                                                </span>
                                            </div>

                                            <p className="fw-semibold text-dark mb-2">
                                                {parsed.questionText}
                                            </p>

                                            {/* Список вариантов выбора */}
                                            {parsed.options && (
                                                <div className="mb-3 ps-2 border-start border-2 border-primary-subtle">
                                                    {parsed.options.map((opt, i) => (
                                                        <div key={i} className="small text-muted py-0.5">
                                                            <strong>{i + 1})</strong> {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Блок сопоставления соответствий */}
                                            {parsed.mappingItems && parsed.mappingTargets && (
                                                <Row className="g-2 mb-3 small bg-light p-2 rounded">
                                                    <Col sm={6}>
                                                        <div className="fw-bold mb-1">Элементы:</div>
                                                        {parsed.mappingItems.map((item) => (
                                                            <div key={item.key}>
                                                                <strong>{item.key})</strong> {item.text}
                                                            </div>
                                                        ))}
                                                    </Col>
                                                    <Col sm={6}>
                                                        <div className="fw-bold mb-1">Значения / Определения:</div>
                                                        {parsed.mappingTargets.map((item) => (
                                                            <div key={item.key}>
                                                                <strong>{item.key})</strong> {item.text}
                                                            </div>
                                                        ))}
                                                    </Col>
                                                </Row>
                                            )}

                                            <Form.Group>
                                                <Form.Label className="small text-muted mb-1">
                                                    Ваш ответ:
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    size="sm"
                                                    disabled={submitting}
                                                    placeholder={parsed.placeholder}
                                                    value={answers[task.id] || ""}
                                                    onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                                                    style={{ maxWidth: "300px" }}
                                                />
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer className="bg-light">
                {submittedSuccess ? (
                    <Button variant="success" size="sm" onClick={handleClose}>
                        Закрыть
                    </Button>
                ) : (
                    <>
                        <Button variant="secondary" size="sm" onClick={handleClose} disabled={submitting}>
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!isAllAnswered || submitting || loading}
                        >
                            {submitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Отправка...
                                </>
                            ) : (
                                "Завершить и отправить"
                            )}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default TestingModal;