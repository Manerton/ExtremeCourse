import React from "react";
import { Navbar, Nav, Dropdown, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { PersonCircle, BoxArrowInRight } from "react-bootstrap-icons";
import ThemeToggleButton from "../../Helpers/ThemeToggleButton";
import { useAuth } from "../../Helpers/AuthContext";

import MainLogo from "/vsoshLogo.png";
import MainLogo2 from "/vsoshLogoHor.png";

import logoVOSh from '../../../assets/images/v51_9.png';

function Header() {
  const { user, logout, initialized } = useAuth();
 
    const navigate = useNavigate()
    const pageLogout = () => {
        logout()
        navigate("/")
    }

  //console.log(user);

  if (!initialized) {
    return <Navbar><Container>Загрузка...</Container></Navbar>;
  }

  // Проверка на авторизацию
  const isAuthenticated = user;


  return (
    <Navbar expand="lg" sticky="top" className="bg-body-tertiary border border-1">
      <Container fluid="lg" className="mx-auto">
        <Navbar.Brand as={Link} to="/"><img src={MainLogo2} alt="ВСОШ" className="img-fluid" style={{
          maxHeight: "40px",
          width: "auto",
        }} /></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="navbar-expand-lg">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Главная</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/RegionalStages">
              <Nav.Link>Региональные этапы</Nav.Link>
            </LinkContainer>

                        {user?.role === 1 && (
                            <LinkContainer to="/AdminPanel">
                                <Nav.Link>Панель Администрирования</Nav.Link>
                            </LinkContainer>
                        )}
                    </Nav>

                    {/* ПРАВАЯ ЧАСТЬ */}
                    <Nav className="align-items-start">
                        {isAuthenticated ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="light"
                                    id="dropdown-user"
                                    className="d-flex align-items-center border-0 bg-transparent"
                                >
                                    <PersonCircle size={24} className="me-2" />
                                    <span className="text-body">{user?.Email}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/PersonalAccount">
                                        <PersonCircle className="me-2" /> Личный кабинет
                                    </Dropdown.Item>

                                    <Dropdown.Item onClick={pageLogout}>
                                        <BoxArrowInRight className="me-2" /> Выйти
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Nav.Link as={Link} to="/auth" className="d-flex align-items-center">
                                <BoxArrowInRight className="me-2" />
                                Войти
                            </Nav.Link>
                        )}

                        {/* Кнопка темы справа
                        <div className="ms-3 d-flex align-items-start">
                            <ThemeToggleButton />
                        </div> */}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
