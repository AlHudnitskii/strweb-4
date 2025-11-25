import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

function DogImage() {
  const { user } = useContext(AuthContext);
  const [dogImageUrl, setDogImageUrl] = useState("");

  const fetchDogImage = async () => {
    if (!user) return;
    try {
      const response = await axios.get("https://dog.ceo/api/breeds/image/random");
      setDogImageUrl(response.data.message);
    } catch (error) {
      console.error("Ошибка при загрузке изображения собаки:", error);
    }
  };

  useEffect(() => {
    fetchDogImage();
  }, [user]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Случайная собака для настроения</h2>
      {user ? (
        dogImageUrl ? (
          <img
            src={dogImageUrl}
            alt="Random Dog"
            style={{ width: "300px", borderRadius: "10px" }}
          />
        ) : (
          <p>Загрузка...</p>
        )
      ) : (
        <p>Пожалуйста, войдите, чтобы увидеть изображения собак.</p>
      )}
      {user && (
        <button onClick={fetchDogImage} style={{ marginTop: "20px", padding: "10px" }}>
          Показать другую собаку
        </button>
      )}
    </div>
  );
}

export default DogImage;
