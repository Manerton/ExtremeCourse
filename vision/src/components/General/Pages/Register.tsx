import React, { useEffect, useState, useMemo } from "react";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    InputGroup,
    ListGroup,
} from "react-bootstrap";
import { EyeFill, EyeSlashFill, LockFill, PersonFill, BuildingFill, HeartFill, CheckCircleFill, PhoneFill } from "react-bootstrap-icons";
import { useMask } from "@react-input/mask";
import { useAuth } from "../../Helpers/AuthContext";
import { useNavigate } from "react-router-dom";
import type { RegisterForm } from "../../types/user";
import axios from "axios";
import { axiosSendSMSCode } from "../../../requests/NotificationRequests";
import {
    axiosSSOVerifySMSCode,
    axiosSSOVerifyEmail,
    axiosSSOVerifyPhoneNumber,
    axiosSSODistrict, axiosSSOSchool
} from "../../../requests/SSORequests";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { ru } from "date-fns/locale/ru";
registerLocale("ru", ru);

// Выносим интерфейсы для пропсов
interface StepProps {
    // Step1
    regEmail: string;
    setRegEmail: (email: string) => void;
    regPassword: string;
    setRegPassword: (password: string) => void;
    confirmPassword: string;
    setConfirmPassword: (password: string) => void;
    emailError: string;
    setEmailError: (error: string) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    showConfirmPassword: boolean;
    setShowConfirmPassword: (show: boolean) => void;
    validateEmail: (email: string) => boolean;
    passwordMismatch: boolean;

    // Step2
    firstName: string;
    setFirstName: (name: string) => void;
    surName: string;
    setSurName: (name: string) => void;
    patronymic: string;
    setPatronymic: (name: string) => void;
    birthdate: string;
    setBirthdate: (date: string) => void;
    gender: number;
    setGender: (gender: number) => void;

    // Step3
    districts: any[];
    selectedDistrictId: string;
    setSelectedDistrictId: (id: string) => void;
    schoolsInDistrict: any[];
    selectedSchoolId: string;
    setSelectedSchoolId: (id: string) => void;
    classNumber: number;
    setClassNumber: (num: number) => void;

    // Step4
    citizenship: number;
    setCitizenship: (citizenship: number) => void;
    disability: number;
    setDisability: (disability: number) => void;

    // Step5
    CITIZENSHIP_TEXT: Record<number, string>;
    DISABILITY_TEXT: Record<number, string>;

    // Step6
    phoneNumber: string;
    setPhoneNumber: (phone: string) => void;
    smsSent: boolean;
    setSmsSent: (sent: boolean) => void;
    smsCode: string;
    setSmsCode: (code: string) => void;
    errorSMS: string;
    cooldown: number;
    sendSMS: () => void;
    verifySMS: () => void;

    // Общие
    setStep: (step: number) => void;
}

// Выносим компоненты шагов ВНЕ основного компонента
const Step1: React.FC<StepProps> = ({ regEmail, setRegEmail,
    regPassword, setRegPassword,
    confirmPassword, setConfirmPassword,
    emailError, setEmailError,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    validateEmail,
    passwordMismatch,
    setStep }) => {

    const [emailSystemError, setEmailSystemError] = useState("");
    const [emailChecking, setEmailChecking] = useState(false);
    const isPasswordEight = (str: string) => str.trim().length >= 8;

    // Debounced email check
    useEffect(() => {
        if (!regEmail || !validateEmail(regEmail)) {
            setEmailSystemError("");
            return;
        }

        const controller = new AbortController();

        const timer = setTimeout(() => {
            setEmailChecking(true);
            setEmailSystemError("");

            axiosSSOVerifyEmail(regEmail, { signal: controller.signal })
                .then((res) => {
                    if (!res.data) setEmailSystemError("Почта уже зарегистрирована");
                })
                .catch((err) => {
                    if (!axios.isCancel(err)) setEmailSystemError("Ошибка проверки почты");
                })
                .finally(() => setEmailChecking(false));
        }, 500);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [regEmail, validateEmail]);

    return (
        <>
            <h4 className="fw-bold mt-3 mb-3 text-center">
                Создание личного кабинета
                <span className="text-muted fs-6 d-block mt-1">Шаг 1 из 6</span>
            </h4>

            <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Электронная почта</Form.Label>
                <Form.Control
                    type="email"
                    value={regEmail}
                    placeholder="example@mail.ru"
                    onChange={(e) => {
                        const value = e.target.value;
                        setRegEmail(value);
                        // локальная проверка формата
                        setEmailError(
                            !value ? "" : (validateEmail(value) ? "" : "Некорректный формат почты")
                        );
                    }}
                    isInvalid={!!emailError || !!emailSystemError}
                />

                <Form.Control.Feedback type="invalid">
                    {emailError || emailSystemError}
                </Form.Control.Feedback>

            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Пароль</Form.Label>
                <InputGroup>
                    <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        size="md"
                    />
                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                    Минимум 8 символов, используйте буквы и цифры
                </Form.Text>
                {!isPasswordEight(regPassword) && (
                    <div className="text-danger small mt-1">
                        Пароль должен содержать не менее 8 символов
                    </div>
                )}
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Подтверждение пароля</Form.Label>
                <InputGroup>
                    <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        isInvalid={passwordMismatch}
                        size="md"
                    />
                    <Button variant="outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
                </InputGroup>
                {passwordMismatch && (
                    <div className="text-danger small mt-1">
                        Пароли не совпадают
                    </div>
                )}
            </Form.Group>

            <Button
                disabled={
                    !regEmail ||
                    !!emailError ||
                    !!emailSystemError ||
                    emailChecking ||
                    !regPassword ||
                    passwordMismatch || !isPasswordEight(regPassword)
                }
                onClick={() => setStep(2)}
            >
                {emailChecking ? "Проверка..." : "Продолжить"}
            </Button>
        </>
    );
};

const Step2: React.FC<StepProps> = ({
    firstName, setFirstName,
    surName, setSurName,
    patronymic, setPatronymic,
    birthdate, setBirthdate,
    gender, setGender,
    setStep
}) => {
    // Простая валидация: только кириллица и дефис/пробел
    const isValidName = (str: string) => /^[\u0400-\u04FF\s-]*$/.test(str.trim());
    const isNameFilled = (str: string) => str.trim().length >= 2;

    const nameError = !isValidName(firstName) || !isNameFilled(firstName) ? "Укажите имя только русскими буквами" : "";
    const surnameError = !isValidName(surName) || !isNameFilled(surName) ? "Укажите фамилию только русскими буквами" : "";
    const patronymicError = patronymic !== "" && !isValidName(patronymic) ? "Отчество только русскими буквами" : "";

    const canProceed =
        isNameFilled(firstName) && isValidName(firstName) &&
        isNameFilled(surName) && isValidName(surName) &&
        birthdate &&
        gender > 0;

    const [birthdateError, setBirthdateError] = useState("");

    const validateAge = (dateString: string) => {
        const birth = new Date(dateString);
        const today = new Date();

        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age >= 10 && age <= 20;
    };

    const handleBirthChange = (value: string) => {
        setBirthdate(value);

        if (!value) {
            setBirthdateError("Укажите дату рождения");
            return;
        }

        if (!validateAge(value)) {
            setBirthdateError("Возраст должен быть от 10 до 18 лет");
        } else {
            setBirthdateError(""); // ок
        }
    };

    const minDate = new Date(
        new Date().getFullYear() - 20,
        0,
        1
    ); // 01.01.(текущий год - 20)

    const earliestAllowedDate = new Date(
        new Date().getFullYear() - 20,
        0,
        1
    );

    const latestAllowedDate = new Date(
        new Date().getFullYear() - 10,
        11,
        31
    );



    return (
        <>
            <h4 className="fw-bold mt-3 mb-3 text-center">
                Личные данные
                <span className="text-muted fs-6 d-block mt-1">Шаг 2 из 6</span>
            </h4>

            <Form.Group className="mb-2">
                <Form.Label className="fw-semibold">Фамилия</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Иванов"
                    value={surName}
                    onChange={(e) => setSurName(e.target.value)}
                    isInvalid={!!surnameError}
                    size="md"
                    autoFocus
                />
                <Form.Text className="text-muted">
                    Как в паспорте или свидетельстве о рождении
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                    {surnameError}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-2">
                <Form.Label className="fw-semibold">Имя</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Иван"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    isInvalid={!!nameError}
                    size="md"
                />
                <Form.Control.Feedback type="invalid">
                    {nameError}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-2">
                <Form.Label className="fw-semibold">
                    Отчество
                    <span className="text-muted fw-normal"> (при наличии)</span>
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Иванович"
                    value={patronymic}
                    onChange={(e) => setPatronymic(e.target.value)}
                    isInvalid={!!patronymicError}
                    size="md"
                />
                <Form.Text className="text-muted">
                    Если отчества нет — оставьте поле пустым
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                    {patronymicError}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-2">
                <Form.Label className="fw-semibold me-2">Дата рождения: </Form.Label>

                <DatePicker
                    selected={birthdate ? new Date(birthdate) : new Date("2007-01-01")}
                    onChange={(date: Date | null) => {
                        if (!date) {
                            handleBirthChange("");
                            return;
                        }
                        const iso = date.toISOString().split("T")[0];
                        handleBirthChange(iso);
                    }}
                    dateFormat="dd.MM.yyyy"
                    locale={ru}
                    maxDate={latestAllowedDate}
                    minDate={earliestAllowedDate}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    placeholderText="Выберите дату"
                    className={`form-control ${birthdateError ? "is-invalid" : ""}`}
                />

                {birthdateError && (
                    <div className="invalid-feedback d-block">{birthdateError}</div>
                )}
            </Form.Group>



            <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Пол</Form.Label>
                <div className="d-flex gap-4 justify-content-center">
                    <Form.Check
                        type="radio"
                        label="Мужской"
                        name="gender"
                        id="male"
                        checked={gender === 1}
                        onChange={() => setGender(1)}
                    />
                    <Form.Check
                        type="radio"
                        label="Женский"
                        name="gender"
                        id="female"
                        checked={gender === 2}
                        onChange={() => setGender(2)}
                    />
                </div>
            </Form.Group>

            <div className="d-flex flex-column gap-3">
                <Button
                    size="md"
                    className="w-100 fw-semibold"
                    disabled={!canProceed}
                    onClick={() => setStep(3)}
                >
                    Продолжить
                </Button>

                <Button
                    variant="secondary"
                    className="w-100"
                    onClick={() => setStep(1)}
                >
                    Назад
                </Button>
            </div>
        </>
    );
};


const Step3: React.FC<StepProps> = ({
    districts,
    selectedDistrictId, setSelectedDistrictId,
    schoolsInDistrict,
    selectedSchoolId, setSelectedSchoolId,
    classNumber, setClassNumber,
    setStep
}) => {
    const customOrder = ["Частные", "Федеральные", "Подведомственные МОиН АО"];

    const districtNameMap: Record<string, string> = {
        "Частные": "Частная",
        "Федеральные": "Министерство внутренних дел РФ",
        "Подведомственные МОиН АО": "Министерство образования и науки АО"
    };

    const sortedDistricts = useMemo(() => {

        const special = districts
            .filter((d: any) => customOrder.includes(d.name.trim()))
            .sort((a: any, b: any) =>
                customOrder.indexOf(a.name.trim()) - customOrder.indexOf(b.name.trim())
            );

        const others = districts
            .filter((d: any) => !customOrder.includes(d.name.trim()))
            .sort((a: any, b: any) => {
                const aIsMO = a.name.startsWith("МО г. Астрахань");
                const bIsMO = b.name.startsWith("МО г. Астрахань");
                if (aIsMO && !bIsMO) return -1;
                if (!aIsMO && bIsMO) return 1;
                return a.name.localeCompare(b.name, "ru");
            });

        return [...special, ...others];
    }, [districts]);

    const canProceed = !!selectedDistrictId && !!selectedSchoolId;

    return (
        <>
            <h4 className="fw-bold mt-3 mb-3 text-center">
                Образовательное учреждение
                <span className="text-muted fs-6 d-block mt-1">Шаг 3 из 6</span>
            </h4>

            {/* Муниципальное образование */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Муниципальное образование/Учредитель</Form.Label>
                <Form.Select
                    value={selectedDistrictId}
                    onChange={(e) => {
                        setSelectedDistrictId(e.target.value);
                        setSelectedSchoolId("");
                    }}
                    size="md"
                >
                    <option value="">Выберите...</option>

                    {/* Особые категории */}
                    {sortedDistricts.some((d: any) => customOrder.includes(d.name.trim())) && (
                        <>
                            <option disabled className="fw-bold text-primary">
                                ─── Особые категории ───
                            </option>
                            {sortedDistricts
                                .filter((d: any) => customOrder.includes(d.name.trim()))
                                .map((d: any) => (
                                    <option key={d.id} value={d.id}>
                                        {districtNameMap[d.name.trim()] ?? d.name}
                                    </option>
                                ))}
                        </>
                    )}

                    {/* Муниципальные */}
                    {sortedDistricts.some((d: any) => !customOrder.includes(d.name.trim())) && (
                        <>
                            <option disabled className="fw-bold text-primary">
                                ─── Муниципальные образования ───
                            </option>
                            {sortedDistricts
                                .filter((d: any) => !customOrder.includes(d.name.trim()))
                                .map((d: any) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                        </>
                    )}
                </Form.Select>
            </Form.Group>

            {/* Школа */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Образовательное учреждение</Form.Label>
                <Form.Select
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    disabled={!selectedDistrictId}
                    size="md"
                >
                    <option value="">
                        {selectedDistrictId ? "Выберите школу..." : "Выберите муниципальное образование"}
                    </option>
                    {schoolsInDistrict.map((s: any) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {/* Класс */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Класс, в котором Вы обучаетесь</Form.Label>
                <Form.Select
                    value={classNumber}
                    onChange={(e) => setClassNumber(Number(e.target.value))}
                >
                    {[5, 6, 7, 8, 9, 10, 11].map(n => (
                        <option key={n} value={n}>{n} класс</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <div className="d-flex flex-column gap-3">
                <Button
                    size="md"
                    className="w-100 fw-semibold"
                    disabled={!canProceed}
                    onClick={() => setStep(4)}
                >
                    Продолжить
                </Button>
                <Button
                    variant="secondary"
                    className="w-100"
                    onClick={() => setStep(2)}
                >
                    Назад
                </Button>
            </div>
        </>
    );
};

const Step4: React.FC<StepProps> = ({
    citizenship, setCitizenship,
    disability, setDisability,
    setStep
}) => (
    <>
        <h4 className="fw-bold mt-3 mb-3 text-center">
            Дополнительная информация
            <span className="text-muted fs-6 d-block mt-1">Шаг 4 из 6</span>
        </h4>

        <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Гражданство</Form.Label>
            <div className="d-flex flex-column gap-2 mt-2">
                <Form.Check
                    type="radio"
                    id="citizenship-russia"
                    label="Россия"
                    checked={citizenship === 1}
                    onChange={() => setCitizenship(1)}
                />
                <Form.Check
                    type="radio"
                    id="citizenship-other"
                    label="Другое"
                    checked={citizenship === 2}
                    onChange={() => setCitizenship(2)}
                />
            </div>
        </Form.Group>

        <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">
                Наличие ограничений возможностей здоровья (ОВЗ)
            </Form.Label>
            <div className="d-flex flex-column gap-2 mt-2">
                <Form.Check
                    type="radio"
                    id="disability-no"
                    label="Нет"
                    checked={disability === 1}
                    onChange={() => setDisability(1)}
                />
                <Form.Check
                    type="radio"
                    id="disability-yes"
                    label="Есть"
                    checked={disability === 2}
                    onChange={() => setDisability(2)}
                />
            </div>
            <Form.Text className="text-muted">
                ОВЗ — это особенности здоровья, при которых может понадобиться помощь или особые условия для прохождения олимпиады.
                Если сомневаетесь, лучше выбрать «Нет».
            </Form.Text>
        </Form.Group>

        <Button className="w-100"
            disabled={!disability || !citizenship}
            onClick={() => setStep(5)}>
            Далее
        </Button>
        <Button variant="secondary" className="w-100 mt-3" onClick={() => setStep(3)}>
            Назад
        </Button>
    </>
);

const Step5: React.FC<StepProps> = ({
    surName, firstName, patronymic,
    birthdate, regEmail,
    selectedSchoolId, schoolsInDistrict,
    classNumber, citizenship, disability,
    CITIZENSHIP_TEXT, DISABILITY_TEXT,
    setStep
}) => {
    const selectedSchool = schoolsInDistrict.find((s: any) => s.id === selectedSchoolId);
    const schoolName = selectedSchool?.name || "Не выбрана";

    return (
        <>
            <h4 className="fw-bold mt-3 mb-3 text-center">
                Подтверждение данных
                <span className="text-muted fs-6 d-block mt-1">Шаг 5 из 6</span>
            </h4>
            <p>Проверьте свои данные перед завершением регистрации:</p>

            <ListGroup className="mb-4">
                <ListGroup.Item>ФИО:<strong> {surName} {firstName} {patronymic} </strong></ListGroup.Item>
                <ListGroup.Item>
                    Дата рождения: <strong> {birthdate && new Date(birthdate).toLocaleDateString("ru-RU")} </strong>
                </ListGroup.Item>
                <ListGroup.Item>Почта: <strong> {regEmail} </strong> </ListGroup.Item>
                <ListGroup.Item>Школа: <strong> {schoolName} </strong> </ListGroup.Item>
                <ListGroup.Item>Класс обучения: <strong> {classNumber} </strong> </ListGroup.Item>
                <ListGroup.Item>Гражданство: <strong>{CITIZENSHIP_TEXT[citizenship]}</strong></ListGroup.Item>
                <ListGroup.Item>ОВЗ: <strong>{DISABILITY_TEXT[disability]}</strong></ListGroup.Item>
            </ListGroup>

            <Button className="w-100" onClick={() => setStep(6)}>
                Всё верно, продолжить
            </Button>
            <Button variant="secondary" className="w-100 mt-3" onClick={() => setStep(4)}>
                Вижу ошибку, вернуться назад
            </Button>
        </>
    );
};


const Step6: React.FC<StepProps> = ({
    phoneNumber,
    setPhoneNumber,
    smsSent,
    setSmsSent,
    smsCode,
    setSmsCode,
    errorSMS,
    cooldown,
    sendSMS,
    verifySMS,
    setStep,
}) => {

    // маска номера телефона
    const inputRef = useMask({
        mask: "+7 (___) ___-__-__",
        replacement: { _: /\d/ },
    });

    const [phoneSystemError, setPhoneSystemError] = useState("");
    const [phoneChecking, setPhoneChecking] = useState(false);

    const digitsOnly = phoneNumber.replace(/\D/g, "");
    const isPhoneFilled = digitsOnly.length === 11; // +7 + 10 цифр

    // Debounced phone check
    useEffect(() => {
        if (!isPhoneFilled) {
            setPhoneSystemError("");
            return;
        }

        const controller = new AbortController();

        const timer = setTimeout(() => {
            setPhoneChecking(true);
            setPhoneSystemError("");

            axiosSSOVerifyPhoneNumber(digitsOnly, { signal: controller.signal })
                .then((res) => {
                    if (!res.data) setPhoneSystemError("Номер уже зарегистрирован");
                })
                .catch((err) => {
                    if (!axios.isCancel(err)) setPhoneSystemError("Ошибка проверки номера");
                })
                .finally(() => setPhoneChecking(false));
        }, 500);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [phoneNumber, isPhoneFilled, digitsOnly]);

    return (
        <>
            <h4 className="fw-bold mt-3 mb-3 text-center">
                Подтверждение номера телефона с помощью звонка
                <span className="text-muted fs-6 d-block mt-1">Шаг 6 из 6</span>
            </h4>

            <p className="mb-4">
                Осталось ввести номер сотового телефона и подтвердить его для создания личного кабинета.
                <strong> Мы совершим автоматический звонок и продиктуем код подтверждения.</strong>
            </p>

            {/* телефон */}
            <Form.Group className="mb-4">
                <Form.Control
                    ref={inputRef}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    type="tel"
                    className="fs-5"
                    isInvalid={!!phoneSystemError}
                />
                <Form.Control.Feedback type="invalid">
                    {phoneSystemError}
                </Form.Control.Feedback>
            </Form.Group>

            {/* кнопка звонка теперь */}
            <Button
                className="w-100 mb-4"
                size="md"
                onClick={sendSMS}
                disabled={!isPhoneFilled || cooldown > 0 || !!phoneSystemError || phoneChecking}
            >
                {!smsSent ? "Получить телефонный звонок и услышать код" : "Позвонить повторно"}
            </Button>

            {/* информация о повторном звонке */}
            {cooldown > 0 && (
                <div className="text-center mb-3 text-muted">
                    Повторный звонок доступен через {cooldown} сек.
                </div>
            )}

            {/* ввод кода */}
            <Form.Group className="mb-3">
                <Form.Control
                    placeholder="Введите код, продиктованный по телефону"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="text-center fs-4"
                // style={{ letterSpacing: "0.4rem" }}
                />
            </Form.Group>

            {errorSMS && (
                <div className="text-danger text-center mb-3 fw-medium">{errorSMS}</div>
            )}

            {/* кнопка проверки кода */}
            <Button
                className="w-100 mb-3"
                size="md"
                onClick={verifySMS}
                disabled={smsCode.length < 4}
            >
                Подтвердить код
            </Button>

            <Button
                variant="secondary"
                className="w-100 mt-4"
                onClick={() => setStep(5)}
            >
                Назад
            </Button>

        </>
    );
};


/*const Step6: React.FC<StepProps> = ({
                                       phoneNumber,
                                       setPhoneNumber,
                                       smsSent,
                                       setSmsSent,
                                       smsCode,
                                       setSmsCode,
                                       errorSMS,
                                       cooldown,
                                       sendSMS,
                                       verifySMS,
                                       setStep,
                                   }) => {

   // маска номера телефона
   const inputRef = useMask({
       mask: "+7 (___) ___-__-__",
       replacement: { _: /\d/ },
   });

   const [phoneSystemError, setPhoneSystemError] = useState("");
   const [phoneChecking, setPhoneChecking] = useState(false);

   const digitsOnly = phoneNumber.replace(/\D/g, "");
   const isPhoneFilled = digitsOnly.length === 11; // +7 + 10 цифр

   // Debounced phone check
   useEffect(() => {
       if (!isPhoneFilled) {
           setPhoneSystemError("");
           return;
       }

       const controller = new AbortController();

       const timer = setTimeout(() => {
           setPhoneChecking(true);
           setPhoneSystemError("");

           axiosSSOVerifyPhoneNumber("+70000000001", { signal: controller.signal })
               .then((res) => {
                   if (!res.data) setPhoneSystemError("Номер уже зарегистрирован");
               })
               .catch((err) => {
                   if (!axios.isCancel(err)) setPhoneSystemError("Ошибка проверки номера");
               })
               .finally(() => setPhoneChecking(false));
       }, 500);

       return () => {
           clearTimeout(timer);
           controller.abort();
       };
   }, [phoneNumber, isPhoneFilled, digitsOnly]);

   return (
       <>
           <h4 className="fw-bold mt-3 mb-3 text-center">
               Подтверждение номера сотового телефона
               <span className="text-muted fs-6 d-block mt-1">Шаг 6 из 6</span>
           </h4>

           <p className="mb-4">
               Осталось подтвердить номер телефона:<br />
               <strong>{phoneNumber || "+7 (___) ___-__-__"}</strong>
           </p>

           {/!* телефон *!/}
           <Form.Group className="mb-4">
               <Form.Control
                   ref={inputRef}
                   value={phoneNumber}
                   onChange={(e) => setPhoneNumber(e.target.value)}
                   placeholder="+7 (___) ___-__-__"
                   type="tel"
                   className="fs-5"
                   isInvalid={!!phoneSystemError}
               />
               <Form.Control.Feedback type="invalid">{phoneSystemError}</Form.Control.Feedback>
           </Form.Group>

           {/!* кнопка отправки SMS *!/}
           <Button
               className="w-100 mb-4"
               size="md"
               onClick={sendSMS}
               disabled={!isPhoneFilled || cooldown > 0 || !!phoneSystemError || phoneChecking}
           >
               {!smsSent ? "Отправить SMS-код" : "Отправить код повторно"}
           </Button>

           {/!* информация о повторной отправке *!/}
           {cooldown > 0 && (
               <div className="text-center mb-3 text-muted">
                   Повторная отправка доступна через {cooldown} сек.
               </div>
           )}

           {/!* ввод кода *!/}
           <Form.Group className="mb-3">
               <Form.Control
                   placeholder="Введите код из SMS"
                   value={smsCode}
                   onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                   maxLength={6}
                   className="text-center fs-4"
                   style={{ letterSpacing: "0.4rem" }}
               />
           </Form.Group>

           {errorSMS && (
               <div className="text-danger text-center mb-3 fw-medium">{errorSMS}</div>
           )}

           {/!* кнопка проверки кода *!/}
           <Button
               className="w-100 mb-3"
               size="md"
               onClick={verifySMS}
               disabled={smsCode.length < 4}
           >
               Подтвердить код
           </Button>

           {/!* назад *!/}
           <Button
               variant="secondary"
               className="w-100 mt-4"
               onClick={() => setStep(5)}
           >
               Назад
           </Button>
       </>
   );
};*/



const RegisterPage: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    // Все стейты для регистрации
    const [firstName, setFirstName] = useState("");
    const [surName, setSurName] = useState("");
    const [patronymic, setPatronymic] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [gender, setGender] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [smsSent, setSmsSent] = useState(false);
    const [smsCode, setSmsCode] = useState("");
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const retryTimeouts = [60, 180, 300];
    const [cooldown, setCooldown] = useState(0);
    const [errorSMS, setErrorSMS] = useState("");
    const [districts, setDistricts] = useState([]);
    const [selectedDistrictId, setSelectedDistrictId] = useState("");
    const [citizenship, setCitizenship] = useState(0);
    const [disability, setDisability] = useState(0);
    const [schoolsInDistrict, setSchoolsInDistrict] = useState([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [schoolQuery, setSchoolQuery] = useState("");
    const [classNumber, setClassNumber] = useState(5);
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [emailChecking, setEmailChecking] = useState(false);
    const [emailSystemError, setEmailSystemError] = useState("");


    const passwordMismatch = regPassword !== confirmPassword;

    const CITIZENSHIP_TEXT: Record<number, string> = {
        0: "Не выбрано", 1: "Россия", 2: "Другое",
    };

    const DISABILITY_TEXT: Record<number, string> = {
        0: "Не выбрано", 1: "Нет", 2: "Есть",
    };

    const hints: Record<number, { title: string; text: React.ReactNode[]; icon?: React.ReactNode }> = {
        1: { title: "Шаг 1: Почта и пароль", text: ["Укажите актуальную электронную почту: она будет использована для связи с Вами. Укажите надежный пароль"], icon: <LockFill size={48} className="mb-3 text-white opacity-75" /> },
        2: {
            title: "Шаг 2: Расскажите о себе",
            text: ["Пожалуйста, будьте предельно аккуратны при указании Ваших ФИО. В случае внесения ошибочных сведений Вы можете быть не допущены к участию в олимпиаде."],
            icon: <PersonFill size={48} className="mb-3 text-white opacity-75" />
        },
        3: {
            title: "Шаг 3: Где Вы учитесь?",
            text: [
                <>
                    Сначала укажите, кому подчиняется Ваша школа, и затем выберите во втором выпадающем списке свою школу, после чего укажите класс обучения.
                </>,
                <span key="note">
                    <strong className="text-danger">Примечание:</strong>{" "}
                    <strong> ГБОУ АО "АТЛ"</strong>, <strong>ГБОУ АО "АЛГ"</strong>,
                    <strong> ГБОУ АО "Инженерная школа"</strong>,
                    <strong> ГБОУ АО "Православная гимназия" </strong>,
                    <strong> ГБОУ АО "ШОД им. А.П.Гужвина" </strong>,
                    подчиняются {""}
                    <br></br>
                    <strong className="text-primary">«Министерство образования и науки АО»</strong>.
                    <br />
                    Пожалуйста, выбирайте эту опцию в списке «Муниципальное образование/Учредитель».
                </span>
            ],
            icon: <BuildingFill size={48} className="mb-3 text-white opacity-75" />
        },
        4: {
            title: "Шаг 4: Дополнительная информация",
            text: ["необходима для корректного оформления документов и оказания помощи на олимпиаде."],
            icon: <HeartFill size={48} className="mb-3 text-white opacity-75" />
        },
        5: {
            title: "Шаг 5: Проверьте внимательно!",
            text: ["Убедитесь, что всё верно!"],
            icon: <CheckCircleFill size={48} className="mb-3 text-white opacity-75" />
        },
        6: {
            title: "Шаг 6: Подтверждение номера телефона с помощью звонка",
            text: ["Укажите Ваш номер телефона. Система автоматически позвонит Вам и продиктует код подтверждения. После получения кода введите его в поле ниже."],
            icon: <PhoneFill size={48} className="mb-3 text-white opacity-75" />
        },
    };

    // 6: {
    //     title: "Шаг 6: Подтверждение номера сотового телефона",
    //         text: "Укажите ваш контактный номер сотового телефона - Он необходим для создания личного кабинета и позволит нам связаться с Вами. После этого нажмите кнопку отправки смс. Когда получите код, введите его в поле ввода для кода",
    //         icon: <PhoneFill size={48} className="mb-3 text-white opacity-75" />
    // },


    ////////////////////////////////////////////////
    // SMS Logics
    ////////////////////////////////////////////////

    const sendSMS = async () => {
        try {
            setErrorSMS("");

            //setPhoneNumber(phoneNumber.replace(/\D/g, ""))

            //запрос на отправку SMS
            const data = await axiosSendSMSCode(phoneNumber.replace(/\D/g, ""));
            // data можно использовать, если backend вернёт что-то вроде { success: true }

            setSmsSent(true);

            // выставляем задержку на повтор
            const timeout = retryTimeouts[Math.min(attempts, retryTimeouts.length - 1)];
            setCooldown(timeout);

        } catch (e) {
            console.error("Error sending SMS:", e);
            setErrorSMS("Ошибка отправки SMS. Попробуйте позже.");
        }
    };


    const verifySMS = async () => {
        try {
            setErrorSMS("");
            const result = await axiosSSOVerifySMSCode(phoneNumber.replace(/\D/g, ""), smsCode);

            if (!result.data) {
                throw new Error(result.message || "Неверный код");
            }

            setIsPhoneVerified(true);
            await handleFinalSubmit();

        } catch (e) {
            console.error("Неверный код SMS:", e);

            setErrorSMS("Неверный код. Попробуйте снова.");

            // setAttempts(a => {
            //     const next = a + 1;
            //     const timeout = retryTimeouts[Math.min(next, retryTimeouts.length - 1)];
            //     setCooldown(timeout);
            //     return next;
            // });
        }
    };


    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);


    ////////////////////////////////////////////////
    // School Search
    ////////////////////////////////////////////////

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const res = await axiosSSODistrict("30");
                setDistricts(res.data);
            } catch (err) {
                console.error("Ошибка загрузки округов:", err);
            }
        };

        fetchDistricts();
    }, []);

    useEffect(() => {
        if (!selectedDistrictId) return;

        const fetchSchools = async () => {
            try {
                const res = await axiosSSOSchool(selectedDistrictId);
                setSchoolsInDistrict(res.data);
            } catch (err) {
                console.error("Ошибка загрузки школ:", err);
            }
        };

        fetchSchools();
    }, [selectedDistrictId]);


    const validateEmail = (value: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    };

    ////////////////////////////////////////////////
    // Submit
    ////////////////////////////////////////////////

    const handleFinalSubmit = async () => {
        const registerData: RegisterForm = {
            firstname: firstName,
            surname: surName,
            patronymic,
            email: regEmail,
            password: regPassword,
            phone_number: phoneNumber.replace(/\D/g, ""),
            gender: gender.toString(),
            school_id: selectedSchoolId,
            birthdate,
            class_number: classNumber.toString(),
            disability: String(disability),
            citizenship: String(citizenship)
        };

        try {
            await register(registerData);
            navigate('/auth');
        } catch (err) {
            console.error("Registration error:", err);
        }
    };

    // Создаем общий объект пропсов для всех шагов
    const stepProps: StepProps = {
        // Step1
        regEmail, setRegEmail,
        regPassword, setRegPassword,
        confirmPassword, setConfirmPassword,
        emailError, setEmailError,
        showPassword, setShowPassword,
        showConfirmPassword, setShowConfirmPassword,
        validateEmail,
        passwordMismatch,

        // Step2
        firstName, setFirstName,
        surName, setSurName,
        patronymic, setPatronymic,
        birthdate, setBirthdate,
        gender, setGender,

        // Step3
        districts,
        selectedDistrictId, setSelectedDistrictId,
        schoolsInDistrict,
        selectedSchoolId, setSelectedSchoolId,
        classNumber, setClassNumber,

        // Step4
        citizenship, setCitizenship,
        disability, setDisability,

        // Step5
        CITIZENSHIP_TEXT,
        DISABILITY_TEXT,

        // Step6
        phoneNumber, setPhoneNumber,
        smsSent, setSmsSent,
        smsCode, setSmsCode,
        errorSMS,
        cooldown,
        sendSMS, verifySMS,

        // Общие
        setStep
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1 {...stepProps} />;
            case 2: return <Step2 {...stepProps} />;
            case 3: return <Step3 {...stepProps} />;
            case 4: return <Step4 {...stepProps} />;
            case 5: return <Step5 {...stepProps} />;
            case 6: return <Step6 {...stepProps} />;
            default: return <Step1 {...stepProps} />;
        }
    };

    return (
        <Container fluid className="min-vh-50 d-flex flex-column">
            <Row className="flex-grow-1 gy-0">
                {/* Левый блок — только на десктопе */}
                <Col md={6} className="d-none d-md-flex flex-column justify-content-center align-items-center text-center px-5"
                    style={{
                        background: "linear-gradient(135deg, #3a8dde, #4fd1c5)",
                        color: "#fff",
                        borderRadius: "10px 0 0 10px"
                    }}>
                    {hints[step].icon && <div className="mb-2">{hints[step].icon}</div>}
                    <h1 className="fw-bold display-5">{hints[step].title}</h1>
                    {hints[step].text.map((line, index) => (
                        <p
                            key={index}
                            className={
                                index === 1
                                    ? "lead p-3 bg-light text-dark rounded border-start border-4 border-warning"
                                    : "lead"
                            }
                        >
                            {line}
                        </p>
                    ))}
                    <div className="mt-0">
                        <span className="badge bg-white text-primary fs-6 px-4 py-2 rounded-pill">
                            Шаг {step} из 6
                        </span>
                    </div>
                </Col>

                {/* Правый блок — всегда */}
                <Col xs={12} md={6} className="d-flex flex-column justify-content-center px-4 px-md-5 border border-1 h-100"
                    style={{ borderRadius: "0 10px 10px 0" }}>
                    {/*minHeight: "100vh"*/}
                    {/* Мобильная подсказка — только на телефоне */}
                    <div className="d-block d-md-none mb-0 text-center">
                        <div className="rounded-4 p-4 shadow-sm" style={{
                            background: "linear-gradient(135deg, #3a8dde, #4fd1c5)",
                            color: "#fff",
                            borderRadius: "10px 0 0 10px"
                        }}>
                            {hints[step].icon && <div className="mb-3">{hints[step].icon}</div>}
                            <h4 className="fw-bold">{hints[step].title}</h4>
                            {hints[step].text.map((line, index) => (
                                <p
                                    key={index}
                                    className={
                                        index === 1
                                            ? "lead p-3 bg-light text-dark rounded border-start border-4 border-warning"
                                            : "lead"
                                    }
                                >
                                    {line}
                                </p>
                            ))}
                            <div className="mt-3">
                                <span className="badge bg-light text-primary">Шаг {step} из 6</span>
                            </div>
                        </div>
                    </div>

                    {/* Основная форма */}
                    <div className="flex-grow-1 d-flex flex-column justify-content-center">
                        {renderStep()}
                    </div>

                    <div className="text-center mt-4 pb-4">
                        <Button variant="link" onClick={() => navigate('/auth')}>
                            Уже есть аккаунт? Войти
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterPage;