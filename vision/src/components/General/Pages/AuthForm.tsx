import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useAuth } from "../../Helpers/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    const { login } = useAuth();

    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");

    const hints = {
        title: "Вход в личный кабинет",
        text: "Введите Ваш логин и пароль, указанные при регистрации, чтобы войти в личный кабинет."
    };

    const handleLogin = async () => {
        setError(null); // очищаем старую ошибку

        const success = await login(authEmail, authPassword);

        if (success) {
            navigate("/");
        } else {
            setError("Неверный адрес электронной почты или пароль");
        }
    };

    return (
        <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
            <Row className="w-100 justify-content-center">
                <Col md={6} className="d-flex flex-column justify-content-center align-items-center text-center"
                    style={{
                        background: "linear-gradient(135deg, #3a8dde, #4fd1c5)",
                        color: "#fff",
                        padding: "2rem",
                        borderRadius: "10px 0 0 10px",
                    }}
                >
                    <h1 className="fw-bold">{hints.title}</h1>
                    <p>{hints.text}</p>
                </Col>

                <Col md={6} className="p-3 border border-1 d-flex flex-column justify-content-center align-items-center"
                    style={{ borderRadius: "0 10px 10px 0", minHeight: "572px" }}
                >
                    <div className="d-flex flex-column justify-content-center align-items-center w-100" style={{ height: "100%" }}>
                        <h4 className="fw-bold mb-3 w-100" style={{ textAlign: "center" }}>Авторизация в личный кабинет</h4>

                        {error && (
                            <div className="alert alert-danger w-100 text-center">
                                {error}
                            </div>
                        )}

                        <Form.Group className="mb-3 w-100">
                            <Form.Control
                                placeholder="Электронная почта"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3 w-100">
                            <Form.Control
                                type="password"
                                placeholder="Пароль"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Button className="w-100" onClick={() => handleLogin()}>
                            Войти
                        </Button>

                        <div className="mt-3 w-100" style={{ textAlign: "center" }}>
                            <Button variant="link" onClick={() => navigate('/register')}>
                                Впервые на сайте? Перейдите к регистрации личного кабинета
                            </Button>
                        </div>

                        <div className="mt-3 w-100" style={{ textAlign: "center" }}>
                            <Button variant="link" onClick={() => navigate('/recover-password')}>
                                Забыли пароль? Восстановите его здесь
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;