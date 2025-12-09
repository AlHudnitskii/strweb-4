import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../axiosInstance";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        username,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      login({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      navigate("/clients");
    } catch (error) {
      console.error("Ошибка авторизации:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Ошибка авторизации");
    }
  };

  const handleGoogleLogin = () => {
    // Используем относительный путь или полный URL из переменной окружения
    const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="container">
      <h2>Авторизация</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input type="submit" value="Войти" />
      </form>

      <button onClick={handleGoogleLogin} className="google-button">
        Войти через Google
      </button>
    </div>
  );
}

export default LoginPage;
