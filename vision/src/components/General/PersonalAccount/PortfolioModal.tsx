import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal, Button, Form, Alert, Badge, InputGroup } from "react-bootstrap";
import {
    Achievement,
    AchievementType,
    PortfolioData,
    axiosUploadPortfolio,
    axiosUpdatePortfolio,
    MINOBR_OLYMPIADS,
    SubjectCode,
} from "../../../requests/PortfolioRequests";
import { BsBoxArrowUpRight, BsInfoCircle, BsSearch, BsX, BsFileEarmarkArrowDown } from "react-icons/bs";

interface Props {
    show: boolean;
    onHide: () => void;
    applicationId: string;
    programName: string;
    subjectName: string;
    classParticipation: number;
    token: string;
    existingPortfolio?: PortfolioData | null;
    onSuccess: () => void;
}

const BASE_CONFLICT_PAIRS: Record<string, AchievementType> = {
    [Achievement.VsoshMunWinner]: Achievement.VsoshMunPrizeWinner,
    [Achievement.VsoshMunPrizeWinner]: Achievement.VsoshMunWinner,

    [Achievement.VsoshRegWinner]: Achievement.VsoshRegPrizeWinner,
    [Achievement.VsoshRegPrizeWinner]: Achievement.VsoshRegWinner,

    [Achievement.EulerWinner]: Achievement.EulerPrizeWinner,
    [Achievement.EulerPrizeWinner]: Achievement.EulerWinner,

    [Achievement.MaxwellWinner]: Achievement.MaxwellPrizeWinner,
    [Achievement.MaxwellPrizeWinner]: Achievement.MaxwellWinner,

    [Achievement.MathMunWinner]: Achievement.MathMunPrizeWinner,
    [Achievement.MathMunPrizeWinner]: Achievement.MathMunWinner,

    [Achievement.MathRegWinner]: Achievement.MathRegPrizeWinner,
    [Achievement.MathRegPrizeWinner]: Achievement.MathRegWinner,
};

MINOBR_OLYMPIADS.forEach((item) => {
    BASE_CONFLICT_PAIRS[item.winnerCode] = item.prizeCode;
    BASE_CONFLICT_PAIRS[item.prizeCode] = item.winnerCode;
});

function getSubjectCode(name: string): SubjectCode | null {
    const s = name.toLowerCase();
    if (s.includes("матем")) return "MATHEMATICS";
    if (s.includes("физик")) return "PHYSICS";
    if (s.includes("биолог")) return "BIOLOGY";
    if (s.includes("эконом")) return "ECONOMICS";
    if (s.includes("хим")) return "CHEMISTRY";
    if (s.includes("информ") || s.includes("програм")) return "INFORMATICS";
    return null;
}

function getSubjectDative(subject: string): string {
    const s = subject.trim().toLowerCase();
    if (s.includes("матем")) return "математике";
    if (s.includes("физик")) return "физике";
    if (s.includes("хим")) return "химии";
    if (s.includes("биолог")) return "биологии";
    if (s.includes("информ")) return "информатике";
    if (s.includes("эконом")) return "экономике";
    if (s.endsWith("а") || s.endsWith("я")) return s.slice(0, -1) + "е";
    return subject;
}

const PortfolioModal: React.FC<Props> = ({
                                             show,
                                             onHide,
                                             applicationId,
                                             programName,
                                             subjectName,
                                             classParticipation,
                                             token,
                                             existingPortfolio,
                                             onSuccess,
                                         }) => {
    const [description, setDescription] = useState("");
    const [selectedAchievements, setSelectedAchievements] = useState<AchievementType[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Ссылка на шаблон презентации (заполнить при наличии)
    const presentationTemplateUrl = "https://disk.yandex.ru/i/AO145eT0WjEwfQ";

    // Поиск и флаг отображения всех предметов
    const [minobrSearch, setMinobrSearch] = useState("");
    const [showAllSubjects, setShowAllSubjects] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditMode = Boolean(existingPortfolio);
    const lowerName = (programName + " " + subjectName).toLowerCase();

    const isMath = lowerName.includes("матем");
    const isPhysics = lowerName.includes("физик");
    const isEconomics = lowerName.includes("эконом");
    const isSeniorClass = classParticipation >= 10 || isEconomics;

    const currentSubjectCode = getSubjectCode(subjectName || programName);
    const subjectDative = getSubjectDative(subjectName || "соответствующей дисциплине");

    useEffect(() => {
        if (existingPortfolio) {
            setDescription(existingPortfolio.description || "");
            const achievementsList =
                existingPortfolio.code_achievement ||
                existingPortfolio.achievements ||
                [];
            setSelectedAchievements(achievementsList);
        } else {
            setDescription("");
            setSelectedAchievements([]);
            setFile(null);
        }
        setMinobrSearch("");
        setShowAllSubjects(false);
        setError(null);
    }, [existingPortfolio, show]);

    const handleCheckboxToggle = (code: AchievementType) => {
        setSelectedAchievements((prev) => {
            if (prev.includes(code)) {
                return prev.filter((c) => c !== code);
            }
            const conflictingCode = BASE_CONFLICT_PAIRS[code];
            const filtered = conflictingCode ? prev.filter((c) => c !== conflictingCode) : prev;
            return [...filtered, code];
        });
    };

    // Сортировка и фильтрация: подходящие под текущий предмет олимпиады идут первыми
    const filteredMinobrOlympiads = useMemo(() => {
        const query = minobrSearch.trim().toLowerCase();

        return MINOBR_OLYMPIADS.filter((item) => {
            if (!showAllSubjects && currentSubjectCode && !query) {
                const isSelected =
                    selectedAchievements.includes(item.winnerCode) ||
                    selectedAchievements.includes(item.prizeCode);
                if (!item.subjects.includes(currentSubjectCode) && !isSelected) {
                    return false;
                }
            }

            if (query) {
                const matchesText =
                    item.name.toLowerCase().includes(query) ||
                    item.id.toString().includes(query);
                if (!matchesText) return false;
            }

            return true;
        });
    }, [minobrSearch, showAllSubjects, currentSubjectCode, selectedAchievements]);

    const selectedMinobrCount = useMemo(() => {
        return MINOBR_OLYMPIADS.filter(
            (o) => selectedAchievements.includes(o.winnerCode) || selectedAchievements.includes(o.prizeCode)
        ).length;
    }, [selectedAchievements]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) {
            setFile(null);
            return;
        }

        const validExtensions = [".pdf", ".pptx"];
        const lowerFileName = selectedFile.name.toLowerCase();
        const isValid = validExtensions.some((ext) => lowerFileName.endsWith(ext));

        if (!isValid) {
            setError("Разрешены только файлы форматов .pdf и .pptx");
            setFile(null);
            e.target.value = "";
            return;
        }

        setError(null);
        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (selectedAchievements.length === 0) {
            setError("Пожалуйста, отметьте хотя бы одно достижение.");
            return;
        }

        if (!isEditMode && !file) {
            setError("Пожалуйста, прикрепите файл портфолио (.pdf или .pptx).");
            return;
        }

        try {
            setSubmitting(true);

            if (isEditMode) {
                await axiosUpdatePortfolio(
                    token,
                    applicationId,
                    description,
                    selectedAchievements,
                    file
                );
            } else {
                await axiosUploadPortfolio(
                    token,
                    applicationId,
                    description,
                    selectedAchievements,
                    file!
                );
            }

            onSuccess();
            onHide();
        } catch (err: any) {
            setError(err.response?.data?.message || "Ошибка при сохранении портфолио.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditMode ? "Редактирование портфолио" : "Прикрепление портфолио"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {/* Подсказка участнику */}
                    <Alert variant="warning" className="d-flex align-items-start gap-2 mb-3 shadow-sm border-warning">
                        <BsInfoCircle size={22} className="flex-shrink-0 mt-1 text-warning-emphasis" />
                        <div className="small">
                            <strong>Обратите внимание:</strong> если у вас есть результаты в нескольких олимпиадах или этапах,
                            обязательно <u>отметьте их во всех соответствующих категориях ниже</u>.
                            Неотмеченные пункты <strong>не будут учтены</strong> при формировании рейтинга!
                        </div>
                    </Alert>

                    <div className="mb-4">
                        <Form.Label className="d-block mb-3 fw-bold fs-6">
                            Индивидуальные достижения участника:
                        </Form.Label>

                        {/* 1. Региональный этап ВсОШ (10-11 классы) */}
                        {isSeniorClass && (
                            <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg="info" className="me-2 text-dark">ВсОШ</Badge>
                                    <span className="fw-bold text-dark">
                                        Региональный этап (10–11 классы) ({subjectName})
                                    </span>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-vsosh-reg-win"
                                    className="mb-2"
                                    label={`Победитель регионального этапа ВсОШ по ${subjectDative} за 2025–2026 уч. год`}
                                    checked={selectedAchievements.includes(Achievement.VsoshRegWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.VsoshRegWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-vsosh-reg-prize"
                                    label={`Призёр регионального этапа ВсОШ по ${subjectDative} за 2025–2026 уч. год`}
                                    checked={selectedAchievements.includes(Achievement.VsoshRegPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.VsoshRegPrizeWinner)}
                                />
                            </div>
                        )}

                        {/* 2. Муниципальный этап ВсОШ */}
                        <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                            <div className="d-flex align-items-center mb-2">
                                <Badge bg="primary" className="me-2">ВсОШ</Badge>
                                <span className="fw-bold text-dark">
                                    Муниципальный этап ({subjectName})
                                </span>
                            </div>
                            <Form.Check
                                type="checkbox"
                                id="ach-vsosh-win"
                                className="mb-2"
                                label={`Победитель муниципального этапа ВсОШ по ${subjectDative} за 2025–2026 уч. год`}
                                checked={selectedAchievements.includes(Achievement.VsoshMunWinner)}
                                onChange={() => handleCheckboxToggle(Achievement.VsoshMunWinner)}
                            />
                            <Form.Check
                                type="checkbox"
                                id="ach-vsosh-prize"
                                label={`Призёр муниципального этапа ВсОШ по ${subjectDative} за 2025–2026 уч. год`}
                                checked={selectedAchievements.includes(Achievement.VsoshMunPrizeWinner)}
                                onChange={() => handleCheckboxToggle(Achievement.VsoshMunPrizeWinner)}
                            />
                        </div>

                        {/* 3. Результаты по математике для экономики (Региональный) */}
                        {isEconomics && (
                            <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg="warning" className="me-2 text-dark">ВсОШ</Badge>
                                    <span className="fw-bold text-dark">
                                        Региональный этап по математике (10–11 классы)
                                    </span>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-reg-win"
                                    className="mb-2"
                                    label="Победитель регионального этапа ВсОШ по математике за 2025–2026 уч. год"
                                    checked={selectedAchievements.includes(Achievement.MathRegWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathRegWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-reg-prize"
                                    label="Призёр регионального этапа ВсОШ по математике за 2025–2026 уч. год"
                                    checked={selectedAchievements.includes(Achievement.MathRegPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathRegPrizeWinner)}
                                />
                            </div>
                        )}

                        {/* 4. Результаты по математике для экономики (Муниципальный) */}
                        {isEconomics && (
                            <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg="dark" className="me-2">ВсОШ</Badge>
                                    <span className="fw-bold text-dark">
                                        Муниципальный этап по математике
                                    </span>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-mun-win"
                                    className="mb-2"
                                    label="Победитель муниципального этапа ВсОШ по математике за 2025–2026 уч. год"
                                    checked={selectedAchievements.includes(Achievement.MathMunWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathMunWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-mun-prize"
                                    label="Призёр муниципального этапа ВсОШ по математике за 2025–2026 уч. год"
                                    checked={selectedAchievements.includes(Achievement.MathMunPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathMunPrizeWinner)}
                                />
                            </div>
                        )}

                        {/* 5. Образовательный центр Сириус */}
                        <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                            <div className="d-flex align-items-center mb-2">
                                <Badge bg="primary" className="me-2" style={{ backgroundColor: "#0066cc" }}>
                                    Сириус
                                </Badge>
                                <span className="fw-bold text-dark">
                                    Образовательный центр «Сириус»
                                </span>
                            </div>
                            <Form.Check
                                type="checkbox"
                                id="ach-sirius-participant"
                                label="Участие в профильной смене в образовательном центре Сириус за 2024–2026 год"
                                checked={selectedAchievements.includes(Achievement.SiriusParticipant)}
                                onChange={() => handleCheckboxToggle(Achievement.SiriusParticipant)}
                            />
                        </div>

                        {/* 6. Перечневые олимпиады Минобрнауки с фильтрацией по предмету */}
                        <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                                <div className="d-flex align-items-center">
                                    <Badge bg="success" className="me-2">Минобрнауки</Badge>
                                    <span className="fw-bold text-dark">
                                        Олимпиады из перечня Минобрнауки
                                    </span>
                                    {selectedMinobrCount > 0 && (
                                        <Badge bg="primary" pill className="ms-2">
                                            Выбрано: {selectedMinobrCount}
                                        </Badge>
                                    )}
                                </div>
                                <a
                                    href="https://base.garant.ru/412793733/"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="btn btn-outline-success btn-sm py-1 px-2 d-inline-flex align-items-center"
                                    title="Перейти к официальному перечню на Гарант.ру"
                                >
                                    Перейти к перечню
                                    <BsBoxArrowUpRight className="ms-1" size={11} />
                                </a>
                            </div>

                            {/* Поле поиска и переключатель профилей */}
                            <div className="mb-2">
                                <InputGroup size="sm">
                                    <InputGroup.Text className="bg-white">
                                        <BsSearch className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Поиск по названию олимпиады..."
                                        value={minobrSearch}
                                        onChange={(e) => setMinobrSearch(e.target.value)}
                                    />
                                    {minobrSearch && (
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setMinobrSearch("")}
                                            title="Очистить поиск"
                                        >
                                            <BsX size={18} />
                                        </Button>
                                    )}
                                </InputGroup>

                                {currentSubjectCode && (
                                    <div className="mt-2 d-flex justify-content-between align-items-center">
                                        <Form.Check
                                            type="switch"
                                            id="toggle-all-subjects"
                                            className="small text-muted"
                                            label="Показать олимпиады по всем дисциплинам"
                                            checked={showAllSubjects}
                                            onChange={(e) => setShowAllSubjects(e.target.checked)}
                                        />
                                        <span className="small text-muted">
                                            {showAllSubjects
                                                ? "Все профили"
                                                : `Только профиль: ${subjectName || "текущий"}`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Прокручиваемый список олимпиад */}
                            <div
                                className="bg-white border rounded p-2"
                                style={{ maxHeight: "320px", overflowY: "auto" }}
                            >
                                {filteredMinobrOlympiads.length === 0 ? (
                                    <div className="text-center text-muted py-3 small">
                                        Олимпиады по данному запросу не найдены
                                    </div>
                                ) : (
                                    filteredMinobrOlympiads.map((item) => {
                                        const isWinnerChecked = selectedAchievements.includes(item.winnerCode);
                                        const isPrizeChecked = selectedAchievements.includes(item.prizeCode);
                                        const hasSelection = isWinnerChecked || isPrizeChecked;

                                        return (
                                            <div
                                                key={item.id}
                                                className={`p-2 mb-2 rounded border transition-all ${
                                                    hasSelection
                                                        ? "bg-success-subtle border-success"
                                                        : "bg-light border-light-subtle"
                                                }`}
                                            >
                                                <div className="fw-semibold small text-dark mb-1">
                                                    <span className="text-muted me-1">№{item.id}</span>
                                                    {item.name}
                                                </div>
                                                <div className="d-flex flex-wrap gap-3 ms-2">
                                                    <Form.Check
                                                        type="checkbox"
                                                        id={`minobr-win-${item.id}`}
                                                        label="Победитель"
                                                        className="small"
                                                        checked={isWinnerChecked}
                                                        onChange={() => handleCheckboxToggle(item.winnerCode)}
                                                    />
                                                    <Form.Check
                                                        type="checkbox"
                                                        id={`minobr-prize-${item.id}`}
                                                        label="Призёр"
                                                        className="small"
                                                        checked={isPrizeChecked}
                                                        onChange={() => handleCheckboxToggle(item.prizeCode)}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* 7. Олимпиада Эйлера (математика) */}
                        {isMath && (
                            <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg="warning" className="me-2 text-dark">Математика</Badge>
                                    <span className="fw-bold text-dark">
                                        Олимпиада им. Леонарда Эйлера
                                    </span>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-euler-win"
                                    className="mb-2"
                                    label="Победитель олимпиады им. Леонарда Эйлера за 2025–2026 уч. год"
                                    checked={selectedAchievements.includes(Achievement.EulerWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.EulerWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-euler-prize"
                                    label="Призёр олимпиады им. Леонарда Эйлера за 2025–2026 уч. год"
                                    checked={selectedAchievements.includes(Achievement.EulerPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.EulerPrizeWinner)}
                                />
                            </div>
                        )}

                        {/* 8. Олимпиада Максвелла (физика) */}
                        {isPhysics && (
                            <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg="warning" className="me-2 text-dark">Физика</Badge>
                                    <span className="fw-bold text-dark">
                                        Олимпиада им. Дж. Кл. Максвелла
                                    </span>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-maxwell-win"
                                    className="mb-2"
                                    label="Победитель олимпиады им. Дж. Кл. Максвелла за 2025–2026 уч. год"
                                    checked={selectedAchievements.includes(Achievement.MaxwellWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MaxwellWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-maxwell-prize"
                                    label="Призёр олимпиады им. Дж. Кл. Максвелла за 2025–2026 уч. год"
                                    checked={selectedAchievements.includes(Achievement.MaxwellPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MaxwellPrizeWinner)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Описание портфолио */}
                    <Form.Group className="mb-4">
                        <Form.Label>
                            <strong>Описание портфолио <span className="text-muted fw-normal">(необязательно):</span></strong>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Опишите ваши грамоты, успехи или дайте пояснения к прикрепленным файлам..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>

                    {/* Поле файла */}
                    <Form.Group className="mb-3">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                            <Form.Label className="mb-0">
                                <strong>Загрузите файл с презентацией о себе (.pdf, .pptx):</strong>
                                {!isEditMode && <span className="text-danger ms-1">*</span>}
                            </Form.Label>

                            {/* Блок со ссылкой на шаблон презентации */}
                            <a
                                href={presentationTemplateUrl || "#"}
                                target={presentationTemplateUrl ? "_blank" : undefined}
                                rel="noreferrer noopener"
                                onClick={(e) => {
                                    if (!presentationTemplateUrl) {
                                        e.preventDefault();
                                        alert("Ссылка на шаблон презентации будет добавлена в ближайшее время.");
                                    }
                                }}
                                className="btn btn-outline-primary btn-sm py-1 d-inline-flex align-items-center gap-1"
                                title="Скачать или просмотреть шаблон презентации о себе"
                            >
                                <BsFileEarmarkArrowDown size={14} />
                                <span>Шаблон презентации</span>
                            </a>
                        </div>

                        <Alert
                            variant="warning"
                            className="d-inline-flex align-items-center gap-2 py-1 px-3 mb-2 small rounded-pill border-0 bg-warning-subtle text-warning-emphasis"
                        >
                            <BsInfoCircle size={15} className="flex-shrink-0" />
                            <span>Максимальный размер файла — <strong>100 МБ</strong></span>
                        </Alert>

                        {isEditMode && existingPortfolio?.file_path && (
                            <div className="small text-success mb-2 p-2 bg-success-subtle border border-success-subtle rounded">
                                ✓ Уже загружен файл: <code>{existingPortfolio.file_path.split("/").pop()}</code>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="d-none"
                            accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                            onChange={handleFileChange}
                        />

                        <div className="input-group">
                            <Button
                                variant="outline-primary"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <i className="bi bi-paperclip me-1"></i>
                                {file ? "Заменить файл" : "Выбрать файл"}
                            </Button>
                            <span className="form-control text-truncate bg-white text-muted">
                                {file ? file.name : "Файл не выбран"}
                            </span>
                            {file && (
                                <Button
                                    variant="outline-danger"
                                    type="button"
                                    title="Очистить выбор"
                                    onClick={() => {
                                        setFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                >
                                    ✕
                                </Button>
                            )}
                        </div>

                        <Form.Text className="text-muted d-block mt-2">
                            {isEditMode
                                ? "Прикрепите новый файл, только если хотите заменить ранее загруженный."
                                : "Принимается только один файл форматов .pdf или .pptx."}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={submitting}>
                        Отмена
                    </Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? "Сохранение..." : isEditMode ? "Обновить данные" : "Прикрепить"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default PortfolioModal;