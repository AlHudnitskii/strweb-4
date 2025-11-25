import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { useParams } from "react-router-dom";

function ViewPropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axiosInstance.get(`/api/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке объекта недвижимости:", error);
      }
    };

    fetchProperty();
  }, [id]);

  if (!property) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="container">
      <h2>Детали объекта недвижимости</h2>
      <p>
        <strong>ID:</strong> {property.id}
      </p>
      <p>
        <strong>Название:</strong> {property.title}
      </p>
      <p>
        <strong>Цена:</strong> {property.price} ₽
      </p>
      <p>
        <strong>Местоположение:</strong> {property.location}
      </p>
      <p>
        <strong>Тип:</strong> {property.type}
      </p>
    </div>
  );
}

export default ViewPropertyPage;
