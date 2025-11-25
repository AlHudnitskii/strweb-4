import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axiosInstance.get("/api/clients");
        setClients(Array.isArray(response.data.clients) ? response.data.clients : []);
      } catch (err) {
        console.error("Ошибка при получении клиентов:", err.response?.data || err.message);
        setError("Не удалось загрузить список клиентов.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>Клиенты</h2>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Клиенты</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Клиенты</h2>
      {clients.length === 0 ? (
        <p>Клиенты не найдены.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя клиента</th>
              <th>Контакт</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClientsPage;
