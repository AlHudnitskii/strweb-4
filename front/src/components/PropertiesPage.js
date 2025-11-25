import React, { useEffect, useState, useContext } from "react";
import axiosInstance from "../axiosInstance";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axiosInstance.get("/api/properties");
        setProperties(response.data.properties);
      } catch (error) {
        console.error("Ошибка при получении недвижимости:", error.response?.data || error.message);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((property) =>
    Object.values(property).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortColumn) {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const formatTime = (dateString, options) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", options);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    try {
      await axiosInstance.delete(`/api/properties/${id}`);
      setProperties((prev) => prev.filter((property) => property.id !== id));
    } catch (error) {
      console.error("Ошибка при удалении недвижимости:", error);
    }
  };

  return (
    <div className="container">
      <h2>Недвижимость</h2>
      <div className="search-sort-container">
        <input
          type="text"
          placeholder="Поиск по всем полям..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {user && <button onClick={() => navigate("/properties/create")}>Добавить объект</button>}
      {sortedProperties.length === 0 ? (
        <p>Объекты недвижимости не найдены.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort("id")}>
                ID
                {sortColumn === "id" && (
                  <span className="sort-indicator">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </th>
              <th onClick={() => handleSort("title")}>
                Название
                {sortColumn === "title" && (
                  <span className="sort-indicator">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </th>
              <th onClick={() => handleSort("price")}>
                Цена
                {sortColumn === "price" && (
                  <span className="sort-indicator">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </th>
              <th onClick={() => handleSort("location")}>
                Местоположение
                {sortColumn === "location" && (
                  <span className="sort-indicator">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </th>
              <th onClick={() => handleSort("type")}>
                Тип
                {sortColumn === "type" && (
                  <span className="sort-indicator">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </th>
              <th>Создано (Локальное)</th>
              <th>Создано (UTC)</th>
              <th>Обновлено (Локальное)</th>
              <th>Обновлено (UTC)</th>
              {user && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {sortedProperties.map((property) => (
              <tr key={property.id}>
                <td>{property.id}</td>
                <td>{property.title}</td>
                <td>{property.price} ₽</td>
                <td>{property.location}</td>
                <td>{property.type}</td>
                <td>{formatTime(property.created_at)}</td>
                <td>{formatTime(property.created_at, { timeZone: "UTC" })}</td>
                <td>{formatTime(property.updated_at)}</td>
                <td>{formatTime(property.updated_at, { timeZone: "UTC" })}</td>
                {user && (
                  <td>
                    <button onClick={() => navigate(`/properties/edit/${property.id}`)}>
                      Редактировать
                    </button>
                    <button onClick={() => handleDelete(property.id)}>Удалить</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PropertiesPage;
