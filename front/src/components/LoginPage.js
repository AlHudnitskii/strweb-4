import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          username,
          password,
        },
        { withCredentials: true },
      );
      const token = response.data.token;

      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      login({ username: decoded.username, id: decoded.id });

      navigate("/clients");
    } catch (error) {
      console.error("Ошибка авторизации:", error.response?.data || error.message);
      alert("Неверные учетные данные");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
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
