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
    BsFileEarmarkPpt,
    BsPersonCircle,
    BsMortarboard,
    BsTrophy,
    BsChevronLeft,
    BsChevronRight,
    BsAward,
    BsSortDown,
    BsSortUp,
    BsArrowDownUp,
    BsFileEarmarkExcel,
    BsDownload,
    BsBoxArrowUpRight,
    BsInfoCircle,
} from "react-icons/bs";
import { useAuth } from "../../Helpers/AuthContext";
import { FullApplicationDetailsDTO } from "../../types/application";
import {
    axiosDefaultApplication,
    axiosGetFullApplications,
    axiosInviteApplication,
    axiosRejectApplication
} from "../../../requests/ApplicationRequests";
import { Achievement, axiosUpdateScores } from "../../../requests/PortfolioRequests";
import { parseAchievement, ParsedAchievement } from "../../../utils/achievementCatalog";
import { axiosDownloadApplicationsExcel, buildFileDownloadUrl } from "../../../requests/FilesRequests";

// Статусы заявок согласно обновленной кодировке
const STATUS_META: Record<number, { text: string; bg: string }> = {
    1: { text: "Одобрено", bg: "success" },
    2: { text: "На рассмотрении", bg: "warning" },
    3: { text: "Отозвана", bg: "secondary" },
    4: { text: "Отклонено", bg: "danger" },
};

// Проверка, указал ли участник "Нет достижений"
const checkHasNoAchievementsCode = (codes?: string[]): boolean => {
    if (!codes || codes.length === 0) return false;
    return codes.includes(Achievement.NoAchievements) || codes.includes("NO_ACHIEVEMENTS");
};

// Получение чистого имени файла без %D0...
const getFileNameFromPath = (path?: string): string => {
    if (!path) return "";
    const rawName = path.split("/").pop() || path;
    try {
        return decodeURIComponent(rawName);
    } catch {
        return rawName;
    }
};

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

const isLocalhost = (url: string) => {
    return (
        url.includes("localhost") ||
        url.includes("127.0.0.1") ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    );
};

const ApplicationsPage: React.FC = () => {
    const { accessToken } = useAuth();

    const [applications, setApplications] = useState<FullApplicationDetailsDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    // Пагинация
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // Фильтры
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
    const [portfolioFilter, setPortfolioFilter] = useState<string>("ALL");

    // Сортировка по баллам
    type SortDir = "asc" | "desc" | null;
    const [sortByScore, setSortByScore] = useState<SortDir>(null);

    // Модальное окно детального просмотра
    const [selectedApp, setSelectedApp] = useState<FullApplicationDetailsDTO | null>(null);

    // Модальное окно предпросмотра файла презентации
    const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

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


    const handleUpdateScore = async () => {
        if (!accessToken) return;
        try {
            const res = await axiosUpdateScores(accessToken)
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Не удалось обновить баллы"
            );
        } 
    }

    const handleExportExcel = async () => {
        if (!accessToken) return;
        setExporting(true);
        setError(null);
        try {
            const { blob, fileName } = await axiosDownloadApplicationsExcel(accessToken);

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Не удалось выгрузить Excel"
            );
        } finally {
            setExporting(false);
        }
    };

    const uniqueSubjects = useMemo(() => {
        const subs = new Set<string>();
        applications.forEach((a) => {
            if (a.event?.subject) subs.add(a.event.subject);
        });
        return Array.from(subs);
    }, [applications]);

    const filteredApps = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        const filtered = applications.filter((app) => {
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

            const hasPortfolio = Boolean(app.portfolio && app.portfolio.id);
            const isNoAchievements = checkHasNoAchievementsCode(app.portfolio?.code_achievement);

            let matchesPortfolio = true;
            if (portfolioFilter === "WITH_ACHIEVEMENTS") {
                matchesPortfolio = hasPortfolio && !isNoAchievements;
            } else if (portfolioFilter === "NO_ACHIEVEMENTS") {
                matchesPortfolio = hasPortfolio && isNoAchievements;
            } else if (portfolioFilter === "NOT_ATTACHED") {
                matchesPortfolio = !hasPortfolio;
            }

            return matchesQuery && matchesStatus && matchesSubject && matchesPortfolio;
        });

        if (sortByScore) {
            const dir = sortByScore === "asc" ? 1 : -1;
            filtered.sort((a, b) => {
                const aScore = a.portfolio?.score ?? 0;
                const bScore = b.portfolio?.score ?? 0;
                return (aScore - bScore) * dir;
            });
        }

        return filtered;
    }, [applications, searchQuery, statusFilter, subjectFilter, portfolioFilter, sortByScore]);

    // Проверяем, выбрал ли выбранный участник пункт "У меня нет достижений"
    const selectedAppHasNoAchievements = useMemo(() => {
        return checkHasNoAchievementsCode(selectedApp?.portfolio?.code_achievement);
    }, [selectedApp]);

    // Парсим только реальные достижения (исключая технический код NO_ACHIEVEMENTS)
    const selectedParsedAchievements = useMemo<ParsedAchievement[]>(() => {
        if (!selectedApp?.portfolio?.code_achievement) return [];
        return selectedApp.portfolio.code_achievement
            .filter((code) => code !== Achievement.NoAchievements && code !== "NO_ACHIEVEMENTS")
            .map(parseAchievement);
    }, [selectedApp]);

    const calculatedTotalScore = useMemo(() => {
        return selectedParsedAchievements.reduce((sum, item) => sum + item.score, 0);
    }, [selectedParsedAchievements]);

    // Обработка одобрения заявки (статус 1)
    const handleInvite = async (appId: string) => {
        if (!accessToken) return;
        setStatusUpdating(true);
        try {
            await axiosInviteApplication(accessToken, appId);
            setApplications((prev) =>
                prev.map((item) => (item.id === appId ? { ...item, status: 1 } : item))
            );
            if (selectedApp && selectedApp.id === appId) {
                setSelectedApp((prev) => (prev ? { ...prev, status: 1 } : null));
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Ошибка при одобрении заявки");
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleDefault = async (appId: string) => {
        if (!accessToken) return;
        setStatusUpdating(true);
        try {
            await axiosDefaultApplication(accessToken, appId);
            setApplications((prev) =>
                prev.map((item) => (item.id === appId ? { ...item, status: 2 } : item))
            );
            if (selectedApp && selectedApp.id === appId) {
                setSelectedApp((prev) => (prev ? { ...prev, status: 2 } : null));
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Ошибка при рассмотрении заявки");
        } finally {
            setStatusUpdating(false);
        }
    };

    // Обработка отклонения заявки (статус 4)
    const handleReject = async (appId: string) => {
        if (!accessToken) return;
        setStatusUpdating(true);
        try {
            await axiosRejectApplication(accessToken, appId);
            setApplications((prev) =>
                prev.map((item) => (item.id === appId ? { ...item, status: 4 } : item))
            );
            if (selectedApp && selectedApp.id === appId) {
                setSelectedApp((prev) => (prev ? { ...prev, status: 4 } : null));
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Ошибка при отклонении заявки");
        } finally {
            setStatusUpdating(false);
        }
    };

    // Проверяем расширение по имени файла или пути, игнорируя query-параметры
    const checkIsPptx = (urlOrPath?: string | null): boolean => {
        if (!urlOrPath) return false;
        try {
            const decoded = decodeURIComponent(urlOrPath).toLowerCase();
            return /\.pptx?($|[?&#])/i.test(decoded);
        } catch {
            return false;
        }
    };

    const isPptx = useMemo(() => {
        return checkIsPptx(previewFileUrl);
    }, [previewFileUrl]);

    const inlineFileUrl = useMemo(() => {
        if (!previewFileUrl) return "";
        const separator = previewFileUrl.includes("?") ? "&" : "?";
        return `${previewFileUrl}${separator}inline=true`;
    }, [previewFileUrl]);

    const toAbsoluteUrl = (url: string): string => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
    };

    const officeViewerUrl = useMemo(() => {
        if (!previewFileUrl) return "";
        const fullAbsoluteUrl = toAbsoluteUrl(previewFileUrl);
        if (isLocalhost(fullAbsoluteUrl)) return "";
        const cleanUrl = decodeURI(fullAbsoluteUrl);
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cleanUrl)}`;
    }, [previewFileUrl]);

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
                        variant="outline-success"
                        size="sm"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={handleExportExcel}
                        disabled={exporting || loading}
                        title="Выгрузить список заявок в Excel"
                    >
                        {exporting ? (
                            <Spinner as="span" animation="border" size="sm" />
                        ) : (
                            <BsFileEarmarkExcel />
                        )}
                        <span>{exporting ? "Экспорт..." : "Экспорт в Excel"}</span>
                    </Button>

                     <Button
                        variant="outline-warning"
                        size="sm"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={handleUpdateScore}
                        title="Обновить баллы"
                    >
                        <span>Обновить баллы</span>
                    </Button>

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
                    <Row className="g-3 align-items-center">
                        <Col md={12} lg={4}>
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
                        <Col sm={4} md={4} lg={2}>
                            <Form.Select
                                size="sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">Все статусы</option>
                                <option value="2">На рассмотрении</option>
                                <option value="1">Одобрено</option>
                                <option value="4">Отклонено</option>
                                <option value="3">Отозвана</option>
                            </Form.Select>
                        </Col>
                        <Col sm={4} md={4} lg={2}>
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
                        <Col sm={4} md={4} lg={2}>
                            <Form.Select
                                size="sm"
                                value={portfolioFilter}
                                onChange={(e) => setPortfolioFilter(e.target.value)}
                            >
                                <option value="ALL">Все портфолио</option>
                                <option value="WITH_ACHIEVEMENTS">С достижениями</option>
                                <option value="NO_ACHIEVEMENTS">Без достижений</option>
                                <option value="NOT_ATTACHED">Не прикреплено</option>
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
                                <th
                                    className="py-3 text-center"
                                    style={{ cursor: "pointer", userSelect: "none" }}
                                    onClick={() => {
                                        setSortByScore((prev) =>
                                            prev === null ? "desc" : prev === "desc" ? "asc" : null
                                        );
                                    }}
                                    title={
                                        sortByScore === null
                                            ? "Сортировать по убыванию баллов"
                                            : sortByScore === "desc"
                                                ? "Сортировать по возрастанию баллов"
                                                : "Сбросить сортировку"
                                    }
                                >
                                    <span className="d-inline-flex align-items-center gap-1 justify-content-center">
                                        Портфолио (Баллы)
                                        {sortByScore === "desc" && <BsSortDown />}
                                        {sortByScore === "asc" && <BsSortUp />}
                                        {sortByScore === null && (
                                            <BsArrowDownUp className="text-muted opacity-50" size={12} />
                                        )}
                                    </span>
                                </th>
                                <th className="py-3 text-center">Класс (уч. / заявка)</th>
                                <th className="py-3">Школа / Район</th>
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
                                    const isNoAchievements = checkHasNoAchievementsCode(app.portfolio?.code_achievement);
                                    const realAchievementsCount =
                                        app.portfolio?.code_achievement?.filter(
                                            (c) => c !== Achievement.NoAchievements && c !== "NO_ACHIEVEMENTS"
                                        ).length || 0;

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

                                            {/* Портфолио: кликабельная карточка с отдельным видом для "Без достижений" */}
                                            <td className="text-center">
                                                {hasPortfolio ? (
                                                    <div
                                                        className="portfolio-clickable d-inline-block text-decoration-none"
                                                        onClick={() => setSelectedApp(app)}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" || e.key === " ") {
                                                                e.preventDefault();
                                                                setSelectedApp(app);
                                                            }
                                                        }}
                                                        title={
                                                            isNoAchievements
                                                                ? "Участник указал отсутствие достижений. Нажмите для просмотра заявки"
                                                                : "Нажмите, чтобы просмотреть ведомость достижений"
                                                        }
                                                    >
                                                        {isNoAchievements ? (
                                                            <>
                                                                <Badge
                                                                    bg="light"
                                                                    text="dark"
                                                                    className="border border-secondary-subtle px-2 py-1"
                                                                >
                                                                    Без достижений (0 б.)
                                                                </Badge>
                                                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                                    Указано участником
                                                                </div>
                                                                <div className="small text-primary mt-1">
                                                                    <BsEye size={11} /> Открыть
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Badge
                                                                    bg="success-subtle"
                                                                    className="text-success border border-success-subtle px-2 py-1 fs-6"
                                                                >
                                                                    {app.portfolio?.score || 0} б.
                                                                </Badge>
                                                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                                    {realAchievementsCount} достижений
                                                                </div>
                                                                <div className="small text-primary mt-1">
                                                                    <BsEye size={11} /> Открыть
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Badge bg="secondary-subtle" className="text-muted border">
                                                        Не прикреплено
                                                    </Badge>
                                                )}
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
                                                        disabled={app.status === 1 || statusUpdating}
                                                        onClick={() => handleInvite(app.id)}
                                                    >
                                                        <BsCheckCircle />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        title="Отклонить заявку"
                                                        disabled={app.status === 4 || statusUpdating}
                                                        onClick={() => handleReject(app.id)}
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

                                        {!selectedAppHasNoAchievements && selectedApp.portfolio?.file_path && (() => {
                                            const fullUrl = buildFileDownloadUrl(selectedApp.portfolio.file_path);
                                            if (!fullUrl) return null;

                                            const fileIsPpt = checkIsPptx(selectedApp.portfolio.file_path);

                                            return (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="d-inline-flex align-items-center gap-2 shadow-sm"
                                                    onClick={() => setPreviewFileUrl(fullUrl)}
                                                >
                                                    {fileIsPpt ? <BsFileEarmarkPpt size={16} /> : <BsFileEarmarkPdf size={16} />}
                                                    <span>Просмотреть презентацию</span>
                                                </Button>
                                            );
                                        })()}
                                    </Card.Header>

                                    <Card.Body className="p-3 d-flex flex-column gap-3">
                                        {/* Сводный баннер итогового балла */}
                                        <div
                                            className={`d-flex justify-content-between align-items-center p-3 rounded-3 border ${
                                                selectedAppHasNoAchievements
                                                    ? "bg-secondary-subtle border-secondary-subtle"
                                                    : "bg-primary-subtle border-primary-subtle"
                                            }`}
                                        >
                                            <div>
                                                <div
                                                    className={`small fw-semibold text-uppercase ${
                                                        selectedAppHasNoAchievements
                                                            ? "text-secondary-emphasis"
                                                            : "text-primary-emphasis"
                                                    }`}
                                                >
                                                    Предварительный балл
                                                </div>
                                                <div
                                                    className={`display-6 fw-bold mb-0 lh-1 mt-1 ${
                                                        selectedAppHasNoAchievements ? "text-secondary" : "text-primary"
                                                    }`}
                                                >
                                                    {selectedAppHasNoAchievements
                                                        ? 0
                                                        : selectedApp.portfolio?.score ?? calculatedTotalScore}{" "}
                                                    <span className="fs-5 fw-normal">баллов</span>
                                                </div>
                                            </div>
                                            <Badge
                                                bg={selectedAppHasNoAchievements ? "secondary" : "primary"}
                                                className="fs-6 px-3 py-2 rounded-pill fw-normal"
                                            >
                                                {selectedAppHasNoAchievements
                                                    ? "Нет достижений"
                                                    : `${selectedParsedAchievements.length} заявленных пунктов`}
                                            </Badge>
                                        </div>

                                        {/* Комментарий участника */}
                                        {selectedApp.portfolio?.description && (
                                            <div className="p-2 px-3 bg-light border rounded-3 small">
                                                <span className="text-muted fw-semibold me-2">Примечание участника:</span>
                                                <span>{selectedApp.portfolio.description}</span>
                                            </div>
                                        )}

                                        {/* Отдельное отображение для NO_ACHIEVEMENTS vs Список олимпиад */}
                                        {selectedAppHasNoAchievements ? (
                                            <div className="p-4 bg-white border border-secondary-subtle rounded-3 text-center my-auto">
                                                <BsInfoCircle size={32} className="text-secondary mb-2" />
                                                <h6 className="fw-bold text-dark mb-1">
                                                    Участник указал отсутствие индивидуальных достижений
                                                </h6>
                                                <p className="text-muted small mb-0">
                                                    При подаче заявки был выбран пункт «У меня нет индивидуальных достижений (портфолио)».
                                                    Презентация не требуется, предварительный рейтинг составляет 0 баллов.
                                                </p>
                                            </div>
                                        ) : selectedParsedAchievements.length > 0 ? (
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

                                                        <div className="text-end text-nowrap flex-shrink-0 ps-2" style={{ minWidth: "90px" }}>
                                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-6 font-monospace py-1 px-2">
                                                                +{item.score} б.
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-muted bg-light border rounded">
                                                Портфолио не прикреплено или список достижений пуст
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Modal.Body>

                    <Modal.Footer className="bg-light d-flex justify-content-between align-items-center">
                        <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                            Закрыть
                        </Button>

                        <div className="d-flex align-items-center gap-2">
                            {selectedApp.status === 1 && (
                                <span className="text-success small fw-semibold me-2 d-inline-flex align-items-center gap-1">
                                    <BsCheckCircle /> Заявка одобрена
                                </span>
                            )}
                            {selectedApp.status === 4 && (
                                <span className="text-danger small fw-semibold me-2 d-inline-flex align-items-center gap-1">
                                    <BsXCircle /> Заявка отклонена
                                </span>
                            )}
                            {selectedApp.status === 3 && (
                                <span className="text-muted small me-2">Заявка отозвана участником</span>
                            )}

                            <Button
                                variant="outline-danger"
                                disabled={selectedApp.status === 4 || statusUpdating}
                                onClick={() => handleReject(selectedApp.id)}
                            >
                                {statusUpdating ? <Spinner size="sm" animation="border" /> : "Отклонить"}
                            </Button>
                            <Button
                                variant="warning"
                                disabled={selectedApp.status === 2 || statusUpdating}
                                onClick={() => handleDefault(selectedApp.id)}
                            >
                                {statusUpdating ? <Spinner size="sm" animation="border" /> : "Отправить на рассмотрение"}
                            </Button>
                            <Button
                                variant="success"
                                disabled={selectedApp.status === 1 || statusUpdating}
                                onClick={() => handleInvite(selectedApp.id)}
                            >
                                {statusUpdating ? <Spinner size="sm" animation="border" /> : "Одобрить заявку"}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Всплывающее окно браузерного предпросмотра файлов (PDF / PPTX) */}
            {previewFileUrl && (
                <Modal
                    show={Boolean(previewFileUrl)}
                    onHide={() => setPreviewFileUrl(null)}
                    size="xl"
                    centered
                    dialogClassName="modal-90w"
                >
                    <Modal.Header closeButton className="bg-light py-2">
                        <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                            <div className="d-flex align-items-center gap-2 text-truncate me-2">
                                {isPptx ? (
                                    <BsFileEarmarkPpt className="text-warning fs-5 flex-shrink-0" />
                                ) : (
                                    <BsFileEarmarkPdf className="text-danger fs-5 flex-shrink-0" />
                                )}
                                <span className="fw-bold text-dark text-truncate" title={getFileNameFromPath(previewFileUrl)}>
                                    {getFileNameFromPath(previewFileUrl)}
                                </span>
                                <Badge bg={isPptx ? "warning" : "danger"} text={isPptx ? "dark" : "light"} className="fw-normal">
                                    {isPptx ? "PowerPoint" : "PDF"}
                                </Badge>
                            </div>
                            <div className="d-flex gap-2 flex-shrink-0">
                                <Button
                                    as="a"
                                    href={previewFileUrl}
                                    download={getFileNameFromPath(previewFileUrl)}
                                    variant="outline-secondary"
                                    size="sm"
                                    className="d-inline-flex align-items-center gap-1"
                                >
                                    <BsDownload />
                                    <span>Скачать</span>
                                </Button>
                                {!isPptx && (
                                    <Button
                                        as="a"
                                        href={inlineFileUrl}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        variant="outline-primary"
                                        size="sm"
                                        className="d-inline-flex align-items-center gap-1"
                                        title="Открыть в новой вкладке"
                                    >
                                        <BsBoxArrowUpRight />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Modal.Header>

                    <Modal.Body className="p-0 bg-dark position-relative" style={{ height: "82vh" }}>
                        {isPptx ? (
                            isLocalhost(previewFileUrl) ? (
                                <div className="text-white text-center p-5 d-flex flex-column align-items-center justify-content-center h-100">
                                    <BsFileEarmarkPpt size={48} className="text-warning mb-3" />
                                    <h5 className="mb-2">Файл презентации PowerPoint (.pptx)</h5>
                                    <p className="text mb-4 small" style={{ maxWidth: "520px" }}>
                                        Онлайн-просмотрщик презентаций Microsoft требует публичного доступа к файлу.
                                        В локальной среде (localhost) просмотр выполняется через скачивание файла.
                                    </p>
                                    <Button as="a" href={previewFileUrl} download={getFileNameFromPath(previewFileUrl)} variant="primary" size="md">
                                        <BsDownload className="me-2" /> Скачать презентацию
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-100 h-100 position-relative">
                                    <iframe
                                        src={officeViewerUrl}
                                        title="Презентация PPTX"
                                        width="100%"
                                        height="100%"
                                        style={{ border: "none" }}
                                    />
                                    <div
                                        className="position-absolute top-0 start-50 translate-middle-x mt-3 p-2 px-3 bg-dark bg-opacity-75 rounded text-white small text-center"
                                        style={{ pointerEvents: "auto", backdropFilter: "blur(4px)", zIndex: 10 }}
                                    >
                                        Не отображается?{" "}
                                        <a href={previewFileUrl} download={getFileNameFromPath(previewFileUrl)} className="text-warning fw-semibold text-decoration-underline ms-1">
                                            Скачать файл напрямую
                                        </a>
                                    </div>
                                </div>
                            )
                        ) : (
                            <iframe
                                src={`${inlineFileUrl}#toolbar=1`}
                                title="Просмотр PDF"
                                width="100%"
                                height="100%"
                                style={{ border: "none" }}
                            />
                        )}
                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
};

export default ApplicationsPage;