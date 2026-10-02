import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { axiosSendCode } from "../../../requests/NotificationRequests";
import { axiosSSOForgotPassword } from "../../../requests/SSORequests";
import { ForgotPasswordForm } from "../../types/user";
import { useNavigate } from "react-router-dom";

// Подсказки для левого блока
const hints: Record<number, { title: string; text: string[]; icon?: React.ReactNode }> = {
    1: {
        title: "Шаг 1: Введите Вашу электронную почту указанную при регистрации",
        text: [
            "Мы отправим на него код подтверждения.",
            "Убедитесь, что почта указана корректно."
        ]
    },
    2: {
        title: "Введите код",
        text: [
            "Мы отправили код на вашу электронную почту.",
            "Введите код и новый пароль для восстановления."
        ]
    }
};

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await axiosSendCode(email);
            setStep(2);
        } catch {
            setError("Ошибка при отправке кода");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data: ForgotPasswordForm = {
                mail: email,
                code: code,
                password: password
            };

            await axiosSSOForgotPassword(data);
            alert("Пароль успешно обновлён!");
        } catch {
            setError("Неверный код, попробуйте снова");
        } finally {
            setLoading(false);
        }
    };

    // Рендер формы
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleSendCode}>
                        <h3 className="text-center mb-4">Восстановление пароля</h3>

                        <div className="mb-3">
                            <label className="form-label">Электронная почта</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-danger">{error}</p>}

                        <Button type="submit" className="w-100" disabled={loading}>
                            {loading ? "Отправка..." : "Отправить код"}
                        </Button>
                    </form>
                );

            case 2:
                return (
                    <form onSubmit={handleResetPassword}>
                        <h3 className="text-center mb-4">Подтверждение кода</h3>

                        <div className="mb-3">
                            <label className="form-label">Код подтверждения</label>
                            <input
                                type="text"
                                className="form-control"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Новый пароль</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-danger">{error}</p>}

                        <Button type="submit" className="w-100" disabled={loading}>
                            {loading ? "Обновление..." : "Сбросить пароль"}
                        </Button>
                    </form>
                );
        }
    };

    return (
        <Container fluid className="min-vh-50 d-flex flex-column mt-5">
            <Row className="flex-grow-1 gy-0">
                {/* Левый подсказочный блок */}
                <Col
                    md={6}
                    className="d-none d-md-flex flex-column justify-content-center align-items-center text-center px-5 pb-3"
                    style={{
                        background: "linear-gradient(135deg, #3a8dde, #4fd1c5)",
                        color: "#fff",
                        borderRadius: "10px 0 0 10px"
                    }}
                >
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
                            Шаг {step} из 2
                        </span>
                    </div>
                </Col>

                {/* Правый блок с формой */}
                <Col
                    xs={12}
                    md={6}
                    className="d-flex flex-column justify-content-center px-4 px-md-5 border border-1"
                    style={{ borderRadius: "0 10px 10px 0" }}
                >
                    {/* Подсказка для мобильных */}
                    <div className="d-block d-md-none mb-0 text-center">
                        <div
                            className="rounded-4 p-4 shadow-sm"
                            style={{
                                background: "linear-gradient(135deg, #3a8dde, #4fd1c5)",
                                color: "#fff"
                            }}
                        >
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
                                <span className="badge bg-light text-primary">
                                    Шаг {step} из 2
                                </span>
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

export default ForgotPasswordPage;
