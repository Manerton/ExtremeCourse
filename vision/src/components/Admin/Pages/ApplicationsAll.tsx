import React, { useEffect, useState, useMemo } from "react";
import {
    Container,
    Card,
    Table,
    Badge,
    Button,
    Form,
    InputGroup,
    Spinner,
    Alert,
    Modal,
    Row,
    Col,
    ButtonGroup,
} from "react-bootstrap";
import {
    BsSearch,
    BsArrowClockwise,
    BsCheckCircle,
    BsXCircle,
    BsEye,
    BsFileEarmarkPdf,
    BsPersonCircle,
    BsMortarboard,
    BsTrophy,
    BsChevronLeft,
    BsChevronRight,
    BsAward,
} from "react-icons/bs";
import { useAuth } from "../../Helpers/AuthContext";
import { FullApplicationDetailsDTO } from "../../types/application";
import { axiosGetFullApplications } from "../../../requests/ApplicationRequests";
import { parseAchievement, ParsedAchievement } from "../../../utils/achievementCatalog";

// Статусы заявок
const STATUS_META: Record<number, { text: string; bg: string }> = {
    2: { text: "На рассмотрении", bg: "warning" },
    1: { text: "Одобрено", bg: "success" },
    3: { text: "Отклонено", bg: "danger" },
};

// Форматирование даты рождения (строго число, месяц, год)
const formatBirthDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return dateStr.split("T")[0] || dateStr;
    }
};

// Форматирование даты и времени подачи заявки
const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
};

const ApplicationsPage: React.FC = () => {
    const { accessToken } = useAuth();

    const [applications, setApplications] = useState<FullApplicationDetailsDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Пагинация
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // Фильтры
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [subjectFilter, setSubjectFilter] = useState<string>("ALL");

    // Модальное окно детального просмотра
    const [selectedApp, setSelectedApp] = useState<FullApplicationDetailsDTO | null>(null);

    const loadData = async (currentPage: number, currentLimit: number) => {
        if (!accessToken) return;
        setLoading(true);
        setError(null);
        try {
            const data = await axiosGetFullApplications(accessToken, currentPage, currentLimit);
            setApplications(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Ошибка загрузки списка заявок");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(page, limit);
    }, [page, limit, accessToken]);

    const uniqueSubjects = useMemo(() => {
        const subs = new Set<string>();
        applications.forEach((a) => {
            if (a.event?.subject) subs.add(a.event.subject);
        });
        return Array.from(subs);
    }, [applications]);

    const filteredApps = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return applications.filter((app) => {
            const userName = (app.user?.full_name || "").toLowerCase();
            const email = (app.user?.email || "").toLowerCase();
            const phone = (app.user?.phone_number || "").toLowerCase();
            const eventName = (app.event?.name || "").toLowerCase();

            const matchesQuery =
                !q ||
                userName.includes(q) ||
                email.includes(q) ||
                phone.includes(q) ||
                eventName.includes(q);

            const matchesStatus =
                statusFilter === "ALL" || String(app.status) === statusFilter;

            const matchesSubject =
                subjectFilter === "ALL" || app.event?.subject === subjectFilter;

            return matchesQuery && matchesStatus && matchesSubject;
        });
    }, [applications, searchQuery, statusFilter, subjectFilter]);

    // Преобразуем коды выбранной заявки в структурированный список достижений
    const selectedParsedAchievements = useMemo<ParsedAchievement[]>(() => {
        if (!selectedApp?.portfolio?.code_achievement) return [];
        return selectedApp.portfolio.code_achievement.map(parseAchievement);
    }, [selectedApp]);

    const calculatedTotalScore = useMemo(() => {
        return selectedParsedAchievements.reduce((sum, item) => sum + item.score, 0);
    }, [selectedParsedAchievements]);

    const handleStatusChange = (appId: string, newStatus: number, statusLabel: string) => {
        alert(
            `Действие: Перевод заявки [${appId.slice(0, 8)}] в статус "${statusLabel}".\n(Бэкенд-метод изменения статуса находится в разработке)`
        );
        setApplications((prev) =>
            prev.map((item) => (item.id === appId ? { ...item, status: newStatus } : item))
        );
        if (selectedApp && selectedApp.id === appId) {
            setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
    };

    return (
        <Container fluid className="px-4 py-4">
            {/* Заголовок */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 className="h4 fw-bold mb-1 text-dark">Реестр поданных заявок</h2>
                    <p className="text-muted small mb-0">
                        Панель экспертной проверки достижений, верификации презентаций и допуска к программам
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={() => loadData(page, limit)}
                        disabled={loading}
                    >
                        <BsArrowClockwise className={loading ? "spin" : ""} />
                        <span>Обновить</span>
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {/* Фильтры */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-3">
                    <Row className="g-3">
                        <Col md={6} lg={5}>
                            <InputGroup size="sm">
                                <InputGroup.Text className="bg-white">
                                    <BsSearch className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Поиск по ФИО, email, телефону, программе..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col sm={6} md={3} lg={3}>
                            <Form.Select
                                size="sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">Все статусы</option>
                                <option value="2">На рассмотрении</option>
                                <option value="1">Одобрено</option>
                                <option value="3">Отклонено</option>
                            </Form.Select>
                        </Col>
                        <Col sm={6} md={3} lg={2}>
                            <Form.Select
                                size="sm"
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                            >
                                <option value="ALL">Все предметы</option>
                                {uniqueSubjects.map((sub) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col sm={12} md={12} lg={2} className="text-lg-end">
                            <span className="small text-muted">
                                Заявок на странице: <strong>{filteredApps.length}</strong>
                            </span>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Таблица заявок */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover align="center" className="mb-0 text-nowrap" style={{ fontSize: "0.875rem" }}>
                            <thead className="table-light">
                            <tr>
                                <th className="ps-3 py-3">Кандидат / Контакты</th>
                                <th className="py-3">Программа олимпиады</th>
                                <th className="py-3 text-center">Класс (уч. / заявка)</th>
                                <th className="py-3">Школа / Район</th>
                                <th className="py-3 text-center">Портфолио (Баллы)</th>
                                <th className="py-3 text-center">Статус</th>
                                <th className="py-3">Подано</th>
                                <th className="pe-3 py-3 text-end">Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-5">
                                        <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                                        <span className="text-muted">Загрузка данных...</span>
                                    </td>
                                </tr>
                            ) : filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-5 text-muted">
                                        Заявки не найдены
                                    </td>
                                </tr>
                            ) : (
                                filteredApps.map((app) => {
                                    const statusMeta = STATUS_META[app.status] || { text: "Неизвестно", bg: "secondary" };
                                    const hasPortfolio = Boolean(app.portfolio && app.portfolio.id);
                                    const achievementsCount = app.portfolio?.code_achievement?.length || 0;

                                    const studentClass = app.user?.class;
                                    const participationClass = app.class_participation || app.event?.class;

                                    return (
                                        <tr key={app.id}>
                                            <td className="ps-3">
                                                <div className="fw-bold text-dark">{app.user?.full_name || "—"}</div>
                                                <div className="text-muted small">{app.user?.email || "—"}</div>
                                                <div className="text-muted small font-monospace">{app.user?.phone_number || "—"}</div>
                                            </td>

                                            <td>
                                                <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "250px" }} title={app.event?.name}>
                                                    {app.event?.name || "—"}
                                                </div>
                                                <Badge bg="light" text="dark" className="border">
                                                    {app.event?.subject || "Общий профиль"}
                                                </Badge>
                                            </td>

                                            {/* Класс обучения ученика и класс участия в олимпиаде */}
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-1">
                                                    <Badge bg="secondary-subtle" className="text-dark border" title="Класс обучения ученика">
                                                        {studentClass ? `${studentClass} кл.` : "—"}
                                                    </Badge>
                                                    <span className="text-muted small">→</span>
                                                    <Badge bg="primary-subtle" className="text-primary border border-primary-subtle" title="Класс участия в программе">
                                                        {participationClass ? `${participationClass} кл.` : "—"}
                                                    </Badge>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: "220px" }} title={app.school?.name || app.school?.full_name}>
                                                    {app.school?.name || app.school?.full_name || "—"}
                                                </div>
                                                <small className="text-muted">{app.school?.district_name || "—"}</small>
                                            </td>

                                            {/* Портфолио: кликабельная карточка */}
                                            <td className="text-center">
                                                {hasPortfolio ? (
                                                    <Button
                                                        variant="link"
                                                        className="p-0 text-decoration-none"
                                                        onClick={() => setSelectedApp(app)}
                                                        title="Нажмите, чтобы просмотреть ведомость достижений"
                                                    >
                                                        <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1 fs-6">
                                                            {app.portfolio?.score || 0} б.
                                                        </Badge>
                                                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                            {achievementsCount} подтверждений
                                                        </div>
                                                    </Button>
                                                ) : (
                                                    <Badge bg="secondary-subtle" className="text-muted border">
                                                        Не прикреплено
                                                    </Badge>
                                                )}
                                            </td>

                                            <td className="text-center">
                                                <Badge bg={statusMeta.bg as any} className="px-2 py-1">
                                                    {statusMeta.text}
                                                </Badge>
                                            </td>

                                            <td className="text-muted font-monospace small">
                                                {formatDateTime(app.submitted_at)}
                                            </td>

                                            <td className="pe-3 text-end">
                                                <ButtonGroup size="sm">
                                                    <Button
                                                        variant="outline-primary"
                                                        title="Инспектор заявки"
                                                        onClick={() => setSelectedApp(app)}
                                                    >
                                                        <BsEye />
                                                    </Button>
                                                    <Button
                                                        variant="outline-success"
                                                        title="Одобрить заявку"
                                                        onClick={() => handleStatusChange(app.id, 1, "Одобрено")}
                                                    >
                                                        <BsCheckCircle />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        title="Отклонить заявку"
                                                        onClick={() => handleStatusChange(app.id, 3, "Отклонено")}
                                                    >
                                                        <BsXCircle />
                                                    </Button>
                                                </ButtonGroup>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>

                {/* Пагинация */}
                <Card.Footer className="bg-white border-top py-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <span className="small text-muted">Записей на страницу:</span>
                        <Form.Select
                            size="sm"
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            style={{ width: "80px" }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </Form.Select>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <BsChevronLeft /> Назад
                        </Button>
                        <span className="small fw-semibold px-2">Страница {page}</span>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={applications.length < limit || loading}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Вперед <BsChevronRight />
                        </Button>
                    </div>
                </Card.Footer>
            </Card>

            {/* Модальное окно экспертного отсмотра */}
            {selectedApp && (
                <Modal
                    show={Boolean(selectedApp)}
                    onHide={() => setSelectedApp(null)}
                    size="xl"
                    centered
                    scrollable
                >
                    <Modal.Header closeButton className="bg-light">
                        <div className="d-flex align-items-center gap-3">
                            <h5 className="mb-0 fw-bold">Заявка #{selectedApp.id.slice(0, 8)}</h5>
                            <Badge bg={STATUS_META[selectedApp.status]?.bg as any}>
                                {STATUS_META[selectedApp.status]?.text}
                            </Badge>
                            <span className="text-muted small">
                                Подано: {formatDateTime(selectedApp.submitted_at)}
                            </span>
                        </div>
                    </Modal.Header>

                    <Modal.Body className="p-4 bg-light">
                        <Row className="g-3">
                            {/* Левая колонка: Профиль кандидата и учреждение */}
                            <Col lg={4}>
                                <div className="d-flex flex-column gap-3">
                                    {/* Карточка участника */}
                                    <Card className="border-0 shadow-sm rounded-3">
                                        <Card.Body className="p-3">
                                            <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                                                <BsPersonCircle size={18} />
                                                <span className="fw-bold small text-uppercase">Участник</span>
                                            </div>

                                            <div className="mb-2">
                                                <span className="text-muted small d-block">ФИО</span>
                                                <span className="fw-bold text-dark fs-6">{selectedApp.user?.full_name || "—"}</span>
                                            </div>

                                            <div className="d-flex justify-content-between mb-2">
                                                <div>
                                                    <span className="text-muted small d-block">Дата рождения</span>
                                                    <span className="fw-medium text-dark">{formatBirthDate(selectedApp.user?.birth_date)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted small d-block">Класс обучения</span>
                                                    <Badge bg="secondary-subtle" className="text-dark border">
                                                        {selectedApp.user?.class ? `${selectedApp.user.class} класс` : "—"}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <span className="text-muted small d-block">Контакты</span>
                                                <div className="small text-dark">{selectedApp.user?.email || "—"}</div>
                                                <div className="font-monospace small text-dark">{selectedApp.user?.phone_number || "—"}</div>
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    {/* Карточка школы и программы */}
                                    <Card className="border-0 shadow-sm rounded-3">
                                        <Card.Body className="p-3">
                                            <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                                                <BsMortarboard size={18} />
                                                <span className="fw-bold small text-uppercase">Обучение и программа</span>
                                            </div>

                                            <div className="mb-2">
                                                <span className="text-muted small d-block">Школа</span>
                                                <div className="small fw-semibold text-dark lh-sm">
                                                    {selectedApp.school?.full_name || selectedApp.school?.name || "—"}
                                                </div>
                                                <small className="text-muted d-block mt-1">
                                                    {selectedApp.school?.district_name || "—"}
                                                </small>
                                            </div>

                                            <hr className="my-2 text-muted opacity-25" />

                                            <div className="mb-2">
                                                <span className="text-muted small d-block">Выбранная программа</span>
                                                <div className="fw-bold text-primary small lh-sm">
                                                    {selectedApp.event?.name}
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center pt-1">
                                                <div>
                                                    <span className="text-muted small d-block">Дисциплина</span>
                                                    <span className="small fw-medium">{selectedApp.event?.subject || "—"}</span>
                                                </div>
                                                <div className="text-end">
                                                    <span className="text-muted small d-block">Класс участия</span>
                                                    <Badge bg="primary" className="px-2 py-1">
                                                        {selectedApp.class_participation} класс
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </Col>

                            {/* Правая колонка: Экспертная ведомость достижений */}
                            <Col lg={8}>
                                <Card className="border-0 shadow-sm rounded-3 h-100">
                                    <Card.Header className="bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <BsTrophy className="text-warning fs-5" />
                                            <span className="fw-bold text-dark">Ведомость достижений</span>
                                        </div>

                                        {selectedApp.portfolio?.file_path && (
                                            <Button
                                                as="a"
                                                href={selectedApp.portfolio.file_path}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                variant="primary"
                                                size="sm"
                                                className="d-inline-flex align-items-center gap-2 shadow-sm"
                                            >
                                                <BsFileEarmarkPdf size={16} />
                                                <span>Открыть презентацию</span>
                                            </Button>
                                        )}
                                    </Card.Header>

                                    <Card.Body className="p-3 d-flex flex-column gap-3">
                                        {/* Сводный баннер итогового балла */}
                                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-success-subtle border border-success-subtle">
                                            <div>
                                                <div className="text-success-emphasis small fw-semibold text-uppercase">
                                                    Итоговый подтвержденный балл
                                                </div>
                                                <div className="display-6 fw-bold text-success mb-0 lh-1 mt-1">
                                                    {selectedApp.portfolio?.score ?? calculatedTotalScore} <span className="fs-5 fw-normal">баллов</span>
                                                </div>
                                            </div>
                                            <Badge bg="success" className="fs-6 px-3 py-2 rounded-pill fw-normal">
                                                {selectedParsedAchievements.length} подтвержденных пунктов
                                            </Badge>
                                        </div>

                                        {/* Комментарий участника */}
                                        {selectedApp.portfolio?.description && (
                                            <div className="p-2 px-3 bg-light border rounded-3 small">
                                                <span className="text-muted fw-semibold me-2">Примечание участника:</span>
                                                <span>{selectedApp.portfolio.description}</span>
                                            </div>
                                        )}

                                        {/* Список подтвержденных олимпиад */}
                                        {selectedParsedAchievements.length > 0 ? (
                                            <div className="d-flex flex-column gap-2" style={{ maxHeight: "380px", overflowY: "auto" }}>
                                                {selectedParsedAchievements.map((item, idx) => (
                                                    <div
                                                        key={item.code}
                                                        className="d-flex justify-content-between align-items-center p-2 px-3 bg-white border rounded-2 shadow-none"
                                                    >
                                                        <div className="d-flex align-items-start gap-2 pe-3">
                                                            <span className="text-muted small fw-semibold mt-1" style={{ minWidth: "20px" }}>
                                                                {idx + 1}.
                                                            </span>
                                                            <div>
                                                                <div className="fw-semibold text-dark small lh-sm">
                                                                    {item.olympiadName}
                                                                </div>
                                                                <div className="d-flex align-items-center gap-2 mt-1">
                                                                    <Badge bg="light" text="dark" className="border fw-normal" style={{ fontSize: "0.75rem" }}>
                                                                        {item.category}
                                                                    </Badge>
                                                                    <Badge
                                                                        bg={
                                                                            item.resultType === "Победитель"
                                                                                ? "warning-subtle"
                                                                                : item.resultType === "Призёр"
                                                                                    ? "info-subtle"
                                                                                    : "primary-subtle"
                                                                        }
                                                                        className={
                                                                            item.resultType === "Победитель"
                                                                                ? "text-warning-emphasis border border-warning"
                                                                                : item.resultType === "Призёр"
                                                                                    ? "text-info-emphasis border border-info"
                                                                                    : "text-primary border border-primary"
                                                                        }
                                                                        style={{ fontSize: "0.75rem" }}
                                                                    >
                                                                        <BsAward className="me-1" />
                                                                        {item.resultType}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Блок баллов: строго без переноса строки */}
                                                        <div className="text-end text-nowrap flex-shrink-0 ps-2" style={{ minWidth: "90px" }}>
                                                            <span className="badge bg-success-subtle text-success border border-success-subtle fs-6 font-monospace py-1 px-2">
                                                                +{item.score} б.
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-muted bg-light border rounded">
                                                Участник не указал индивидуальные достижения в портфолио
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Modal.Body>

                    <Modal.Footer className="bg-light d-flex justify-content-between">
                        <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                            Закрыть
                        </Button>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-danger"
                                onClick={() => handleStatusChange(selectedApp.id, 3, "Отклонено")}
                            >
                                Отклонить
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => handleStatusChange(selectedApp.id, 1, "Одобрено")}
                            >
                                Одобрить заявку
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            )}
        </Container>
    );
};

export default ApplicationsPage;