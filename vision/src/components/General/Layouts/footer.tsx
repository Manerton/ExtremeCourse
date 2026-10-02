import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

// Импорты изображений (пути могут отличаться )
import logoVOSh from '../../../assets/images/v51_9.png';
import logoRSH from '../../../assets/images/v49_8.png';
import iconVK from '../../../assets/images/v51_12.png';
import iconSchool from '../../../assets/images/v51_13.png';
import iconTelegram from '../../../assets/images/v51_11.png';

const Footer: React.FC = () => (
  <footer className="pt-3 border bg-body-tertiary">
    <Container fluid="lg">
      <Row className="gy-4">
        {/* Информация */}
        <Col md={4}>
          <h6 className="text-uppercase fw-bold mb-3 text-center">Информация</h6>
          <p className="small text-justify">
            Система для проведения подачи заявок на региональный этап Всероссийской олимпиады школьников.
            С помощью этой системы можно зарегистрироваться, подать заявку на участие, и получить всю необходимую информацию в одном месте.
          </p>
        </Col>

        {/* Представители */}
        <Col md={4} className="text-center">
          <h6 className="text-uppercase fw-bold mb-3">Представители</h6>
          <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
            <img src={logoVOSh} alt="Всероссийская олимпиада" style={{ maxHeight: '120px' }} />
          </div>
          <img src={logoRSH} alt="РШТ" style={{ maxHeight: '70px' }} />
        </Col>

        {/* Контактная информация */}
        <Col md={4} className="text-center">
          <h6 className="text-uppercase fw-bold mb-3 text-center">Контактная информация</h6>
          <div className="text-justify">
            <address className="small mb-3">
              <strong>г. Москва</strong><br />
              ул. Жуковского, д.16<br />
              Телефон: <a href="tel:+74956255980">8 (495) 625-59-80</a><br />
              <a href="mailto:Fcod@edu.gov.ru">Fcod@edu.gov.ru</a>
            </address>
            <address className="small">
              <strong>г. Астрахань</strong><br />
              ул. Анри Барбюса, 7<br />
              Телефон: <a href="tel:+78512442428">+7 8512 442-428</a><br />
              <a href="mailto:schooltech@astrobI.ru">schooltech@astrobI.ru</a>
            </address>
          </div>
          
        </Col>
      </Row>

      {/* Социальные иконки */}
      <Row className="mt-4">
        <Col className="text-center">
          <div className="d-flex justify-content-center align-items-center gap-4">
            <a href="#" aria-label="ВКонтакте">
              <img src={iconVK} alt="VK" style={{ height: '24px' }} />
            </a>
            <a href="#" aria-label="Школьная сеть">
              <img src={iconSchool} alt="School" style={{ height: '24px' }} />
            </a>
            <a href="#" aria-label="Telegram">
              <img src={iconTelegram} alt="Telegram" style={{ height: '24px' }} />
            </a>
          </div>
        </Col>
      </Row>
    </Container>

    {/* Нижняя полоса */}
      <div className="bg-secondary text-center py-2 text-white small">
          © 2025 ГАОУ АО ДО «РШТ»
      </div>
  </footer>
);

export default Footer;
