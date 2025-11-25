import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../axiosInstance";
import TimeZoneInfo from "./TimeZoneInfo";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/auth/logout");
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      alert("Не удалось выйти из системы. Попробуйте снова.");
    }
  };

  return (
    <nav>
      <ul className="nav-list">
        {!user ? (
          <>
            <li className="nav-item">
              <Link to="/login" className="nav-link">
                Авторизация
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link">
                Регистрация
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                Профиль
              </Link>
            </li>
            <li className="nav-item">
              <button onClick={handleLogout} className="nav-button">
                Выйти
              </button>
            </li>
          </>
        )}
        <li className="nav-item">
          <Link to="/clients" className="nav-link">
            Клиенты
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/news" className="nav-link">
            Новости
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/properties" className="nav-link">
            Недвижимость
          </Link>
        </li>
      </ul>
      <TimeZoneInfo />
    </nav>
  );
}

export default Navbar;
