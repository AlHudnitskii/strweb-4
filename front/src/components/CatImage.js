import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
function CatImage() {
  const { user } = useContext(AuthContext);
  const [catImageUrl, setCatImageUrl] = useState("");
  const fetchCatImage = async () => {
    if (!user) return;
    try {
      const response = await axios.get("https://api.thecatapi.com/v1/images/search", {
        headers: {
          "x-api-key": "live_Cn1oc5RyWcPVaPqHysqytRSTNRbPlI6HSVL12EOxHsoCNU0jQakxEvCHjqPoL8No",
        },
      });
      setCatImageUrl(response.data[0].url);
    } catch (error) {
      console.error("Ошибка при загрузке изображения кошки:", error);
    }
  };
  useEffect(() => {
    fetchCatImage();
  }, [user]);
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Случайный котик для настроения</h2>
      {user ? (
        catImageUrl ? (
          <img
            src={catImageUrl}
            alt="Random Cat"
            style={{ width: "300px", borderRadius: "10px" }}
          />
        ) : (
          <p>Загрузка...</p>
        )
      ) : (
        <p>Пожалуйста, войдите, чтобы увидеть изображения котиков.</p>
      )}
      {user && (
        <button onClick={fetchCatImage} style={{ marginTop: "20px", padding: "10px" }}>
          Показать другого котика
        </button>
      )}
    </div>
  );
}
export default CatImage;
