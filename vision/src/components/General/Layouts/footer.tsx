import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaVk, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

import licenseImg from '../../../assets/images/license-preview.png';
import licensePdf from '../../../assets/docs/license.pdf';

const Footer: React.FC = () => {
  const [isLicenseHovered, setIsLicenseHovered] = useState(false);

  // Стиль для белых ссылок с высокой читаемостью
  const linkStyle: React.CSSProperties = {
    color: '#ffffff',
    opacity: 0.88,
    textDecoration: 'none',
    fontSize: '0.92rem',
    transition: 'opacity 0.2s ease, text-decoration 0.2s ease',
  };

  return (
      <footer
          style={{ backgroundColor: '#2352b2' }}
          className="text-white pt-5 pb-4 mt-auto"
      >
        <Container fluid="lg">
          {/* Верхняя часть колонок */}
          <Row className="gy-4 mb-4">

            {/* Колонка 1: Организация и Контакты */}
            <Col md={5} sm={6}>
              <h5 className="fw-bold mb-3 fs-6 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                ГАОУ АО ДО «РШТ»
              </h5>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                <li className="d-flex align-items-center gap-2">
                  <FaMapMarkerAlt className="text-white flex-shrink-0" size={15} />
                  <span style={{ color: '#ffffff', opacity: 0.88, fontSize: '0.92rem' }}>
                  г. Астрахань, ул. Анри Барбюса, 7
                </span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <FaPhoneAlt className="text-white flex-shrink-0" size={14} />
                  <a
                      href="tel:+78512442428"
                      style={linkStyle}
                      className="hover-bright"
                  >
                    +7 (8512) 44-24-28
                  </a>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <FaEnvelope className="text-white flex-shrink-0" size={14} />
                  <a
                      href="mailto:schooltech@astrobl.ru"
                      style={linkStyle}
                      className="hover-bright"
                  >
                    schooltech@astrobl.ru
                  </a>
                </li>
              </ul>
            </Col>

            {/* Колонка 2: Направления / Смены */}
            <Col md={3} sm={6}>
              <h5 className="fw-bold mb-3 fs-6 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                Смены
              </h5>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                <li>
                  <a
                      href="#shifts"
                      style={linkStyle}
                      className="hover-bright"
                  >
                    Расписание смен
                  </a>
                </li>
                <li>
                  <a
                      href="#rules"
                      style={linkStyle}
                      className="hover-bright"
                  >
                    Правила и документы
                  </a>
                </li>
              </ul>
            </Col>

            {/* Колонка 3: Соцсети */}
            <Col md={4} sm={12}>
              <h5 className="fw-bold mb-3 fs-6 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                Мы в сети
              </h5>
              <div className="d-flex align-items-center gap-3">
                {/* MAX */}
                <a
                    href="https://max.ru/id3015112545_gos"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-light rounded-circle p-0 d-inline-flex align-items-center justify-content-center social-btn"
                    style={{ width: '42px', height: '42px', borderWidth: '1.5px', transition: 'all 0.2s ease' }}
                    title="MAX"
                >
                  <img
                      src="https://maxicons.ru/icons/MAX.svg"
                      alt="MAX"
                      width="22"
                      height="22"
                  />
                </a>

                {/* ВКонтакте */}
                <a
                    href="https://vk.com/schooltech"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-light rounded-circle p-0 d-inline-flex align-items-center justify-content-center social-btn"
                    style={{ width: '42px', height: '42px', borderWidth: '1.5px', transition: 'all 0.2s ease' }}
                    title="Мы ВКонтакте"
                >
                  <FaVk size={22} />
                </a>
              </div>
            </Col>

          </Row>

          {/* Разделительная линия */}
          <hr className="border-white my-4" style={{ opacity: 0.35 }} />

          {/* Нижняя полоса */}
          <Row className="align-items-center gy-3">
            <Col md={8} className="text-start">
              <div className="fw-semibold text-white" style={{ fontSize: '0.92rem' }}>
                © ГАОУ АО ДО «РШТ», 2013 – 2026
              </div>
            </Col>

            {/* Лицензия с увеличением */}
            <Col md={4} className="d-flex justify-content-md-end align-items-center">
              <a
                  href={licensePdf}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white text-decoration-none d-flex align-items-center gap-3 p-1 rounded"
                  onMouseEnter={() => setIsLicenseHovered(true)}
                  onMouseLeave={() => setIsLicenseHovered(false)}
              >
                <img
                    src={licenseImg}
                    alt="Лицензия"
                    style={{
                      width: '36px',
                      height: '48px',
                      objectFit: 'cover',
                      borderRadius: '3px',
                      border: '1px solid rgba(255,255,255,0.7)',
                      transform: isLicenseHovered ? 'scale(1.25)' : 'scale(1)',
                      boxShadow: isLicenseHovered ? '0 6px 16px rgba(0,0,0,0.45)' : 'none',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      cursor: 'pointer',
                    }}
                />
                <div
                    className="text-start lh-sm text-white"
                    style={{
                      fontSize: '0.9rem',
                      opacity: isLicenseHovered ? 1 : 0.9,
                      transition: 'opacity 0.2s ease'
                    }}
                >
                  Государственная<br />лицензия
                </div>
              </a>
            </Col>
          </Row>
        </Container>
      </footer>
  );
};

export default Footer;