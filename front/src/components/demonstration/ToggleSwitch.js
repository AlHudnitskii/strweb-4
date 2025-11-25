import React, { useState } from "react";

const ToggleSwitch = () => {
  const [isOn, setIsOn] = useState(false);

  // Функция для переключения состояния
  const toggle = () => setIsOn((prev) => !prev);

  return (
    <div style={styles.componentContainer}>
      <p>Состояние: {isOn ? "Включено" : "Выключено"}</p>
      <button onClick={toggle} style={styles.button}>
        {" "}
        // Обработчик Переключить
      </button>
    </div>
  );
};

const styles = {
  componentContainer: {
    border: "1px solid #ccc",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    backgroundColor: "#e9e9e9",
  },
  button: {
    padding: "5px 10px",
    cursor: "pointer",
  },
};

export default ToggleSwitch;
