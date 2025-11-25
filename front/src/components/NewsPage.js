import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";

function NewsPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get("/api/news");
        setNews(response.data.news);
      } catch (error) {
        console.error("Ошибка при получении новостей:", error.response?.data || error.message);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="container">
      <h2>Новости</h2>
      {news.length === 0 ? (
        <p>Новости не найдены.</p>
      ) : (
        <div className="news-list">
          {news.map((item) => (
            <div key={item.id} className="card">
              <h3 className="card-title">{item.title}</h3>
              <p className="card-content">{item.content}</p>
              <p className="card-date">
                <strong>Дата:</strong> {item.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsPage;
