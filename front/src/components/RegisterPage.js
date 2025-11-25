import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        username,
        password,
      });
      alert("Регистрация успешна! Теперь вы можете войти.");
      navigate("/login");
    } catch (error) {
      console.error("Ошибка регистрации:", error.response?.data || error.message);
      alert("Ошибка регистрации");
    }
  };

  return (
    <div className="container">
      <h2>Регистрация</h2>
      <form onSubmit={handleRegister}>
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
        <input type="submit" value="Зарегистрироваться" />
      </form>
    </div>
  );
}

export default RegisterPage;
