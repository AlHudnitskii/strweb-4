import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { useParams, useNavigate } from "react-router-dom";

function EditPropertyPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axiosInstance.get(`/api/properties/${id}`);
        const property = response.data;
        setTitle(property.title);
        setPrice(property.price);
        setLocation(property.location);
        setType(property.type);
      } catch (error) {
        console.error("Ошибка при загрузке недвижимости:", error);
      }
    };

    fetchProperty();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/properties/${id}`, { title, price, location, type });
      navigate("/properties");
    } catch (error) {
      console.error("Ошибка при редактировании недвижимости:", error);
    }
  };

  return (
    <div className="container">
      <h2>Редактировать объект недвижимости</h2>
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
        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
  );
}

export default EditPropertyPage;
