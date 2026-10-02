import { Link } from "react-router-dom";

const ForbiddenPage: React.FC = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <h1 className="display-3 text-danger fw-bold">403</h1>
      <h2 className="mb-3">Доступ запрещён</h2>
      <p className="text-muted mb-4">
        У вас нет прав для просмотра этой страницы. Если вы считаете, что это ошибка — обратитесь к администратору.
      </p>
      <Link to="/" className="btn btn-primary">
        На главную
      </Link>
    </div>
  );
};

export default ForbiddenPage;
