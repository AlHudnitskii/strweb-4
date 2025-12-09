import React from "react";

// Компонент для отображения даты в двух форматах (локально и UTC)
const DateTimeDisplay = ({ date, label = "" }) => {
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

export default DateTimeDisplay;

