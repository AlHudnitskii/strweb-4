import React from "react";
import Greeting from "./Greeting";
import ClickButton from "./ClickButton";
import Counter from "./Counter";
import ToggleSwitch from "./ToggleSwitch";
import ItemList from "./ItemList";
import Timer from "./Timer";
import UserForm from "./UserForm";

const Dashboard = () => {
  const handleButtonClick = () => {
    alert("Кнопка нажата!");
  };

  return (
    <div style={styles.dashboardContainer}>
      <section style={styles.section}>
        <h2>Компонент Greeting</h2>
        {/*
          ○ Использование декларативной функции
          ○ Применение props, значения по умолчанию
          ○ Использование компонента внутри Dashboard
        */}
        <Greeting name="Алексей" age={30} />
      </section>

      {/* Компонент ClickButton с обработчиком клика и кастомным лейблом */}
      <section style={styles.section}>
        <h2>Компонент ClickButton</h2>
        {/*
          ○ Использование стрелочной функции
          ○ Применение props, значения по умолчанию
          ○ Использование компонента внутри Dashboard
          ○ Добавление обработчика события
        */}
        <ClickButton onClick={handleButtonClick} label="Нажми меня" /> // Обработчик
      </section>

      {/* Классовый компонент Counter */}
      <section style={styles.section}>
        <h2>Компонент Counter</h2>
        {/*
          ○ Использование классового компонента
          ○ Демонстрация работы со state
          ○ Добавление обработчиков событий
          ○ Использование компонента внутри Dashboard
        */}
        <Counter />
      </section>

      {/* Функциональный компонент ToggleSwitch */}
      <section style={styles.section}>
        <h2>Компонент ToggleSwitch</h2>
        {/*
          ○ Использование функционального компонента
          ○ Использование хуков (useState)
          ○ Добавление обработчиков событий
          ○ Использование компонента внутри Dashboard
        */}
        <ToggleSwitch />
      </section>

      {/* Классовый компонент ItemList */}
      <section style={styles.section}>
        <h2>Компонент ItemList</h2>
        {/*
          ○ Использование классового компонента
          ○ Добавление обработчиков событий с передачей параметров
          ○ Использование компонента внутри Dashboard
        */}
        <ItemList />
      </section>

      {/* Функциональный компонент Timer */}
      <section style={styles.section}>
        <h2>Компонент Timer</h2>
        {/*
          ○ Использование функционального компонента
          ○ Использование хуков (useState, useEffect)
          ○ Демонстрация работы со state
          ○ Использование компонента внутри Dashboard
        */}
        <Timer />
      </section>

      {/* Классовый компонент UserForm */}
      <section style={styles.section}>
        <h2>Компонент UserForm</h2>
        {/*
          ○ Использование классового компонента
          ○ Применение props
          ○ Добавление обработчиков событий
          ○ Использование компонента внутри Dashboard
          ○ Демонстрация работы со state
        */}
        <UserForm />
      </section>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  section: {
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fafafa",
  },
};

export default Dashboard;
