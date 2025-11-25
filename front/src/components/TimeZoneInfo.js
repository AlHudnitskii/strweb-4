import React, { useEffect, useState } from "react";

function TimeZoneInfo() {
  const [localDate, setLocalDate] = useState(new Date());
  const [utcDate, setUtcDate] = useState(new Date().toUTCString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLocalDate(new Date());
      setUtcDate(new Date().toUTCString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="timezone-info">
      <p>Текущая дата и время:</p>
      <p>
        Локальная (ТЗ {userTimeZone}): {localDate.toLocaleString()}
      </p>
      <p>UTC: {utcDate}</p>
    </div>
  );
}

export default TimeZoneInfo;
