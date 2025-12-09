import React, { useEffect, useState } from "react";

// Функциональный компонент для отображения информации о таймзоне пользователя
function TimeZoneInfo() {
  const [localDate, setLocalDate] = useState(new Date());
  const [utcDate, setUtcDate] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLocalDate(new Date());
      setUtcDate(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneOffset = -new Date().getTimezoneOffset() / 60;

  return (
    <div className="timezone-info">
      <h4>Информация о таймзоне</h4>
      <div className="timezone-details">
        <p className="timezone-item">
          <strong>Таймзона пользователя:</strong> {userTimeZone}
        </p>
        <p className="timezone-item">
          <strong>Смещение от UTC:</strong> UTC{timeZoneOffset >= 0 ? '+' : ''}{timeZoneOffset}
        </p>
        <p className="timezone-item">
          <strong>Локальное время:</strong> {localDate.toLocaleString('ru-RU', { timeZone: userTimeZone })}
        </p>
        <p className="timezone-item">
          <strong>UTC время:</strong> {utcDate.toUTCString()}
        </p>
        <p className="timezone-item">
          <strong>Текущая дата (локально):</strong> {localDate.toLocaleDateString('ru-RU', { timeZone: userTimeZone })}
        </p>
        <p className="timezone-item">
          <strong>Текущая дата (UTC):</strong> {utcDate.toUTCString().split(' ').slice(0, 4).join(' ')}
        </p>
      </div>
    </div>
  );
}

// Компонент для отображения даты в двух форматах (локально и UTC)
export const DateTimeDisplay = ({ date, label = "" }) => {
  if (!date) return null;

  const dateObj = new Date(date);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="datetime-display">
      {label && <strong>{label}:</strong>}
      <div className="datetime-formats">
        <div className="datetime-local">
          <span className="datetime-label">Локально ({userTimeZone}):</span>
          <span className="datetime-value">
            {dateObj.toLocaleString('ru-RU', { timeZone: userTimeZone })}
          </span>
        </div>
        <div className="datetime-utc">
          <span className="datetime-label">UTC:</span>
          <span className="datetime-value">
            {dateObj.toUTCString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneInfo;
