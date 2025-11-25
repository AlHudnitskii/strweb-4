import React from "react";
import PropTypes from "prop-types";

const ClickButton = ({ onClick, label }) => {
  // Стрелочная функция
  return (
    <button onClick={onClick} style={styles.button}>
      {label}
    </button>
  );
};

// Значение по умолчанию для label
ClickButton.defaultProps = {
  label: "Нажми меня",
};

// Проверка типов props
ClickButton.propTypes = {
  onClick: PropTypes.func.isRequired, // Обработчик
  label: PropTypes.string,
};

const styles = {
  button: {
    padding: "10px 20px",
    margin: "5px",
    cursor: "pointer",
  },
};

export default ClickButton;
