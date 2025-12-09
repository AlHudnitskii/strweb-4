import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../axiosInstance";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          <Link to="/catalog" className="nav-link">
            Каталог
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/cart" className="nav-link">
            Корзина
          </Link>
        </li>
        {user && (
          <li className="nav-item">
            <Link to="/orders" className="nav-link">
              Мои заказы
            </Link>
          </li>
        )}
        <li className="nav-item">
          <Link to="/clients" className="nav-link">
            Клиенты
          </Link>
        </li>
      </ul>
      <div className="timezone-info-compact">
        <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        <span>{currentTime.toLocaleTimeString('ru-RU')}</span>
      </div>
    </nav>
  );
}

export default Navbar;
