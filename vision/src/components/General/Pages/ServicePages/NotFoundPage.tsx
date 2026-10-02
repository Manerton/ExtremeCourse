import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <h1 className="display-3 text-warning fw-bold">404</h1>
      <h2 className="mb-3">Страница не найдена</h2>
      <p className="text-muted mb-4">
        Кажется, вы попали не туда. Проверьте адрес или вернитесь на главную.
      </p>
      <Link to="/" className="btn btn-primary">
        На главную
      </Link>
    </div>
  );
};

export default NotFoundPage;
