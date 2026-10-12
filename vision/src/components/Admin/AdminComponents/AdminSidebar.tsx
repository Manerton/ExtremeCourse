import { useState } from "react";
import { Nav, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  HouseDoor,
  People,
  FileText,
  BoxArrowLeft,
  PersonCircle,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";

import ThemeToggleButton from "../../Helpers/ThemeToggleButton";
import { useAuth } from "../../Helpers/AuthContext";

const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => setCollapsed((c) => !c);

  /** Обёртка: при сворачивании показывает тултип с названием */
  const renderLink = (
      to: string,
      icon: React.ReactNode,
      label: string,
      extraClass = ""
  ) => {
    const link = (
        <NavLink
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
                `sidebar-link d-flex align-items-center ${extraClass} ${
                    isActive ? "sidebar-link--active" : ""
                }`
            }
        >
          <span className="sidebar-link__icon">{icon}</span>
          {!collapsed && <span className="sidebar-link__label">{label}</span>}
        </NavLink>
    );

    return collapsed ? (
        <OverlayTrigger
            placement="right"
            overlay={<Tooltip>{label}</Tooltip>}
        >
          {link}
        </OverlayTrigger>
    ) : (
        link
    );
  };

  return (
      <aside
          className={`admin-sidebar bg-dark text-white d-flex flex-column justify-content-between ${
              collapsed ? "admin-sidebar--collapsed" : ""
          }`}
      >
        {/* ===== ВЕРХ: Профиль ===== */}
        <div>
          <div className="admin-sidebar__profile d-flex align-items-center px-3 py-3">
            <PersonCircle size={28} className="flex-shrink-0 text-primary" />
            {!collapsed && user && (
                <div className="ms-2 overflow-hidden">
                  <div className="fw-semibold text-truncate small" title={user.Email}>
                    {user.Email}
                  </div>
                </div>
            )}
          </div>

          <hr className="border-secondary opacity-25 my-0" />

          {/* ===== НАВИГАЦИЯ ===== */}
          <Nav className="flex-column py-2">
            {!collapsed && (
                <div className="sidebar-section-label px-3 pt-2 pb-1">
                  Разделы
                </div>
            )}

            {renderLink("/", <HouseDoor size={18} />, "На главную")}

            {user?.role === 1 && (
                <>
                  {!collapsed && (
                      <div className="sidebar-section-label px-3 pt-3 pb-1">
                        Администрирование
                      </div>
                  )}

                  {renderLink(
                      "/AdminPanel/UserList",
                      <People size={18} />,
                      "Пользователи"
                  )}

                  {renderLink(
                      "/AdminPanel/AllApplications",
                      <FileText size={18} />,
                      "Рассмотрение заявок"
                  )}
                </>
            )}
          </Nav>
        </div>

        {/* ===== НИЗ: Тема + Выход ===== */}
        <div className="px-3 pb-3 d-flex flex-column gap-2">
          <hr className="border-secondary opacity-25 my-1" />

          <Button
              variant="outline-danger"
              size="sm"
              onClick={logout}
              className={`d-flex align-items-center justify-content-center gap-2 ${
                  collapsed ? "px-2" : ""
              }`}
              title="Выйти"
          >
            <BoxArrowLeft size={16} />
            {!collapsed && <span>Выйти</span>}
          </Button>
        </div>

        {/* ===== Кнопка сворачивания (по центру правого края) ===== */}
        <button
            type="button"
            onClick={toggleSidebar}
            className="admin-sidebar__toggle"
            title={collapsed ? "Развернуть" : "Свернуть"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
  );
};

export default AdminSidebar;