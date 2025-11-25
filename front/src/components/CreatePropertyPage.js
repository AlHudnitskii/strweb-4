import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

function CreatePropertyPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/api/properties", { title, price, location, type });
      navigate("/properties");
    } catch (error) {
      console.error("Ошибка при добавлении недвижимости:", error);
    }
  };

  return (
    <div className="container">
      <h2>Добавить объект недвижимости</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Цена"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Местоположение"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Тип"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <button type="submit">Добавить</button>
      </form>
    </div>
  );
}

export default CreatePropertyPage;
