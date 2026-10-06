import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
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

// Карты взаимоисключающих достижений (Победитель <-> Призёр одного этапа)
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

    const isEditMode = Boolean(existingPortfolio);
    const lowerName = programName.toLowerCase();

    const isMath = lowerName.includes("матем");
    const isPhysics = lowerName.includes("физик");
    const isEconomics = lowerName.includes("эконом");
    const isSeniorClass = classParticipation >= 10 || isEconomics;

    useEffect(() => {
        if (existingPortfolio) {
            setDescription(existingPortfolio.description || "");
            setSelectedAchievements(existingPortfolio.achievements || []);
        } else {
            setDescription("");
            setSelectedAchievements([]);
            setFile(null);
        }
        setError(null);
    }, [existingPortfolio, show]);

    // Взаимное исключение: при выборе одной роли в этапе парная роль автоматически отключается
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

        if (!description.trim()) {
            setError("Укажите описание портфолио.");
            return;
        }

        if (selectedAchievements.length === 0) {
            setError("Выберите хотя бы одно достижение.");
            return;
        }

        if (!isEditMode && !file) {
            setError("Пожалуйста, прикрепите файл портфолио (.pdf или .pptx).");
            return;
        }

        try {
            setSubmitting(true);
            if (isEditMode) {
                // Если при редактировании прикреплен новый файл, используем upload, иначе обновляем текстовые данные
                if (file) {
                    await axiosUploadPortfolio(token, applicationId, description, selectedAchievements, file);
                } else {
                    await axiosUpdatePortfolio(token, applicationId, description, selectedAchievements);
                }
            } else {
                await axiosUploadPortfolio(token, applicationId, description, selectedAchievements, file!);
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

                    <Form.Group className="mb-4">
                        <Form.Label className="d-block mb-2">
                            <strong>Виды индивидуальных достижений:</strong>
                        </Form.Label>

                        {/* Базовые достижения: Муниципальный этап ВсОШ */}
                        <div className="mb-2">
                            <Form.Check
                                type="checkbox"
                                id="ach-vsosh-win"
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

                        {/* Региональный этап ВсОШ (10-11 классы) */}
                        {isSeniorClass && (
                            <div className="mb-2">
                                <Form.Check
                                    type="checkbox"
                                    id="ach-vsosh-reg-win"
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

                        {/* Перечневые олимпиады */}
                        <div className="mb-2">
                            <Form.Check
                                type="checkbox"
                                id="ach-minobr-win"
                                label="Победитель олимпиад из перечня Минпросвещения РФ по соответствующей дисциплине"
                                checked={selectedAchievements.includes(Achievement.MinobrListWinner)}
                                onChange={() => handleCheckboxToggle(Achievement.MinobrListWinner)}
                            />
                            <Form.Check
                                type="checkbox"
                                id="ach-minobr-prize"
                                label="Призёр олимпиад из перечня Минпросвещения РФ по соответствующей дисциплине"
                                checked={selectedAchievements.includes(Achievement.MinobrListPrizeWinner)}
                                onChange={() => handleCheckboxToggle(Achievement.MinobrListPrizeWinner)}
                            />
                        </div>

                        {/* Олимпиада Эйлера (математика) */}
                        {isMath && (
                            <div className="mt-3 pt-2 border-top">
                                <span className="text-muted d-block mb-1 small fw-bold">
                                    Олимпиада им. Леонарда Эйлера:
                                </span>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-euler-win"
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
                            <div className="mt-3 pt-2 border-top">
                                <span className="text-muted d-block mb-1 small fw-bold">
                                    Олимпиада им. Дж. Кл. Максвелла:
                                </span>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-maxwell-win"
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

                        {/* Результаты по математике (экономика) */}
                        {isEconomics && (
                            <div className="mt-3 pt-2 border-top">
                                <span className="text-muted d-block mb-1 small fw-bold">
                                    Результаты ВсОШ по математике:
                                </span>
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-mun-win"
                                    label="Победитель муниципального этапа ВсОШ по математике"
                                    checked={selectedAchievements.includes(Achievement.MathMunWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathMunWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-mun-prize"
                                    label="Призёр муниципального этапа ВсОШ по математике"
                                    checked={selectedAchievements.includes(Achievement.MathMunPrizeWinner)}
                                    onChange={() => handleCheckboxToggle(Achievement.MathMunPrizeWinner)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="ach-math-reg-win"
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
                            </div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label><strong>Описание портфолио:</strong></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Опишите ваши грамоты, успехи или дайте пояснения к прикрепленным файлам..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {/* Поле файла: обязательно при создании, опционально при редактировании */}
                    <Form.Group className="mb-3">
                        <Form.Label>
                            <strong>Файл портфолио (.pdf, .pptx):</strong>
                        </Form.Label>
                        <Form.Control
                            type="file"
                            accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                            onChange={handleFileChange}
                            required={!isEditMode}
                        />
                        <Form.Text className="text-muted d-block mt-1">
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