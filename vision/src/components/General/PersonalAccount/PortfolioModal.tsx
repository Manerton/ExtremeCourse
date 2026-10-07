import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Alert, Badge } from "react-bootstrap";
import {
    Achievement,
    AchievementType,
    PortfolioData,
    axiosUploadPortfolio,
    axiosUpdatePortfolio,
} from "../../../requests/PortfolioRequests";

interface Props {
    show: boolean;
    onHide: () => void;
    applicationId: string;
    programName: string;
    classParticipation: number;
    token: string;
    existingPortfolio?: PortfolioData | null;
    onSuccess: () => void;
}

const CONFLICT_PAIRS: Record<AchievementType, AchievementType> = {
    [Achievement.VsoshMunWinner]: Achievement.VsoshMunPrizeWinner,
    [Achievement.VsoshMunPrizeWinner]: Achievement.VsoshMunWinner,

    [Achievement.VsoshRegWinner]: Achievement.VsoshRegPrizeWinner,
    [Achievement.VsoshRegPrizeWinner]: Achievement.VsoshRegWinner,

    [Achievement.MinobrListWinner]: Achievement.MinobrListPrizeWinner,
    [Achievement.MinobrListPrizeWinner]: Achievement.MinobrListWinner,

    [Achievement.EulerWinner]: Achievement.EulerPrizeWinner,
    [Achievement.EulerPrizeWinner]: Achievement.EulerWinner,

    [Achievement.MaxwellWinner]: Achievement.MaxwellPrizeWinner,
    [Achievement.MaxwellPrizeWinner]: Achievement.MaxwellWinner,

    [Achievement.MathMunWinner]: Achievement.MathMunPrizeWinner,
    [Achievement.MathMunPrizeWinner]: Achievement.MathMunWinner,

    [Achievement.MathRegWinner]: Achievement.MathRegPrizeWinner,
    [Achievement.MathRegPrizeWinner]: Achievement.MathRegWinner,
};

const PortfolioModal: React.FC<Props> = ({
                                             show,
                                             onHide,
                                             applicationId,
                                             programName,
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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditMode = Boolean(existingPortfolio);
    const lowerName = programName.toLowerCase();

    const isMath = lowerName.includes("матем");
    const isPhysics = lowerName.includes("физик");
    const isEconomics = lowerName.includes("эконом");
    const isSeniorClass = classParticipation >= 10 || isEconomics;

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
        setError(null);
    }, [existingPortfolio, show]);

    const handleCheckboxToggle = (code: AchievementType) => {
        setSelectedAchievements((prev) => {
            if (prev.includes(code)) {
                return prev.filter((c) => c !== code);
            }
            const conflictingCode = CONFLICT_PAIRS[code];
            const filtered = conflictingCode ? prev.filter((c) => c !== conflictingCode) : prev;
            return [...filtered, code];
        });
    };

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

        // Достижения остаются обязательными
        if (selectedAchievements.length === 0) {
            setError("Пожалуйста, отметьте хотя бы одно достижение.");
            return;
        }

        // Файл обязателен при первичном создании
        if (!isEditMode && !file) {
            setError("Пожалуйста, прикрепите файл портфолио (.pdf или .pptx).");
            return;
        }

        try {
            setSubmitting(true);

            if (isEditMode) {
                // PATCH multipart/form-data с файлом или без него
                await axiosUpdatePortfolio(
                    token,
                    applicationId,
                    description,
                    selectedAchievements,
                    file
                );
            } else {
                // POST multipart/form-data (файл обязателен)
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

                    {/* Блок достижений */}
                    <div className="mb-4">
                        <Form.Label className="d-block mb-3 fw-bold fs-6">
                            Индивидуальные достижения участника:
                        </Form.Label>

                        {/* Региональный этап ВсОШ (10-11 классы) */}
                        {isSeniorClass && (
                            <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg="info" className="me-2 text-dark">ВсОШ</Badge>
                                    <span className="fw-semibold text-secondary">Региональный этап (10–11 классы)</span>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-vsosh-reg-win"
                                    className="mb-2"
                                    label="Победитель регионального этапа ВсОШ по соответствующей дисциплине"
                                    checked={selectedAchievements.includes(Achievement.VsoshRegWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.VsoshRegWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-vsosh-reg-prize"
                                    label="Призёр регионального этапа ВсОШ по соответствующей дисциплине"
                                    checked={selectedAchievements.includes(Achievement.VsoshRegPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.VsoshRegPrizeWinner)}
                                />
                            </div>
                        )}

                        {/* Базовый блок: Муниципальный этап ВсОШ */}
                        <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                            <div className="d-flex align-items-center mb-2">
                                <Badge bg="primary" className="me-2">ВсОШ</Badge>
                                <span className="fw-semibold text-secondary">Муниципальный этап</span>
                            </div>
                            <Form.Check
                                type="checkbox"
                                id="ach-vsosh-win"
                                className="mb-2"
                                label="Победитель муниципального этапа ВсОШ по соответствующей дисциплине"
                                checked={selectedAchievements.includes(Achievement.VsoshMunWinner)}
                                onChange={() => handleCheckboxToggle(Achievement.VsoshMunWinner)}
                            />
                            <Form.Check
                                type="checkbox"
                                id="ach-vsosh-prize"
                                label="Призёр муниципального этапа ВсОШ по соответствующей дисциплине"
                                checked={selectedAchievements.includes(Achievement.VsoshMunPrizeWinner)}
                                onChange={() => handleCheckboxToggle(Achievement.VsoshMunPrizeWinner)}
                            />
                        </div>



                        {/* Перечневые олимпиады */}
                        <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                            <div className="d-flex align-items-center mb-2">
                                <Badge bg="success" className="me-2">Минобрнауки</Badge>
                                <span className="fw-semibold text-secondary">Олимпиады из перечня Минобрнауки</span>
                            </div>
                            <Form.Check
                                type="checkbox"
                                id="ach-minobr-win"
                                className="mb-2"
                                label="Победитель олимпиад из перечня Минобрнауки по соответствующей дисциплине"
                                checked={selectedAchievements.includes(Achievement.MinobrListWinner)}
                                onChange={() => handleCheckboxToggle(Achievement.MinobrListWinner)}
                            />
                            <Form.Check
                                type="checkbox"
                                id="ach-minobr-prize"
                                label="Призёр олимпиад из перечня Минобрнауки по соответствующей дисциплине"
                                checked={selectedAchievements.includes(Achievement.MinobrListPrizeWinner)}
                                onChange={() => handleCheckboxToggle(Achievement.MinobrListPrizeWinner)}
                            />
                        </div>

                        {/* Олимпиада Эйлера (математика) */}
                        {isMath && (
                            <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg="warning" className="me-2 text-dark">Математика</Badge>
                                    <span className="fw-semibold text-secondary">Олимпиада им. Леонарда Эйлера</span>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-euler-win"
                                    className="mb-2"
                                    label="Победитель олимпиады им. Леонарда Эйлера"
                                    checked={selectedAchievements.includes(Achievement.EulerWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.EulerWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-euler-prize"
                                    label="Призёр олимпиады им. Леонарда Эйлера"
                                    checked={selectedAchievements.includes(Achievement.EulerPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.EulerPrizeWinner)}
                                />
                            </div>
                        )}

                        {/* Олимпиада Максвелла (физика) */}
                        {isPhysics && (
                            <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg="warning" className="me-2 text-dark">Физика</Badge>
                                    <span className="fw-semibold text-secondary">Олимпиада им. Дж. Кл. Максвелла</span>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-maxwell-win"
                                    className="mb-2"
                                    label="Победитель олимпиады им. Дж. Кл. Максвелла"
                                    checked={selectedAchievements.includes(Achievement.MaxwellWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MaxwellWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-maxwell-prize"
                                    label="Призёр олимпиады им. Дж. Кл. Максвелла"
                                    checked={selectedAchievements.includes(Achievement.MaxwellPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MaxwellPrizeWinner)}
                                />
                            </div>
                        )}

                        {/* Результаты по математике для экономики */}
                        {isEconomics && (
                            <div className="p-3 mb-3 border rounded-3 bg-light shadow-sm">
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg="warning" className="me-2 text-dark">Экономика</Badge>
                                    <span className="fw-semibold text-secondary">Достижения ВсОШ по математике</span>
                                </div>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-reg-win"
                                    className="mb-2"
                                    label="Победитель регионального этапа ВсОШ по математике"
                                    checked={selectedAchievements.includes(Achievement.MathRegWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathRegWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-reg-prize"
                                    label="Призёр регионального этапа ВсОШ по математике"
                                    checked={selectedAchievements.includes(Achievement.MathRegPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathRegPrizeWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-mun-win"
                                    className="mb-2"
                                    label="Победитель муниципального этапа ВсОШ по математике"
                                    checked={selectedAchievements.includes(Achievement.MathMunWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathMunWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-mun-prize"
                                    className="mb-2"
                                    label="Призёр муниципального этапа ВсОШ по математике"
                                    checked={selectedAchievements.includes(Achievement.MathMunPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathMunPrizeWinner)}
                                />

                            </div>
                        )}
                    </div>

                    {/* Описание портфолио (теперь необязательное) */}
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

                    {/* Локализованное поле прикрепления файла */}
                    <Form.Group className="mb-3">
                        <Form.Label className="d-block mb-1">
                            <strong>Файл портфолио (.pdf, .pptx):</strong>
                            {!isEditMode && <span className="text-danger ms-1">*</span>}
                        </Form.Label>

                        {isEditMode && existingPortfolio?.file_path && (
                            <div className="small text-success mb-2 p-2 bg-success-subtle border border-success-subtle rounded">
                                ✓ Уже загружен файл: <code>{existingPortfolio.file_path.split("/").pop()}</code>
                            </div>
                        )}

                        {/* Скрытый нативный input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="d-none"
                            accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                            onChange={handleFileChange}
                        />

                        {/* Локализованный кастомный контрол */}
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