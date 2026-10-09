import { Container, Row, Col, Button, Form, Accordion } from 'react-bootstrap';

const AdminPanel: React.FC = () => {
  return (
    <>
      <div
        className="d-flex flex-column justify-content-center align-items-center h-100 text-center p-4"
        style={{ minHeight: '70dvh' }}
      >
        <h1 className="display-4 fw-bold text-center">
          Администрирование<br />
          <hr />
            <div
                className="d-flex flex-column justify-content-center align-items-center h-100 text-center p-3"
            >
                <h1 className="display-4 fw-bold text-center">
                    Профильная смена<br />
                    <span>
                    В{' '}
                        <span className="rsht-letter letter-r">Р</span>
                        <span className="rsht-letter letter-sh">Ш</span>
                        <span className="rsht-letter letter-t">Т</span>
                  </span>
                </h1>

                {/* <p className="lead">
                    Упрощение процессов, помощь талантливым школьникам раскрыть свой потенциал.
                  </p> */}
            </div>
        </h1>

      </div>
    </>
  );
};

export default AdminPanel;