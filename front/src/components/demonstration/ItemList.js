import React, { Component } from "react";

class ItemList extends Component {
  /**
   * Обработчик клика по элементу списка
   * @param {string} item - Название выбранного фрукта
   */
  handleItemClick(item) {
    alert(`Вы выбрали: ${item}`);
  }

  render() {
    const items = ["Яблоко", "Банан", "Апельсин", "Груша"];
    return (
      <div style={styles.componentContainer}>
        <h3>Список фруктов:</h3>
        <ul>
          {items.map((item, index) => (
            <li key={index} style={styles.listItem}>
              <button onClick={() => this.handleItemClick(item)} style={styles.button}>
                {" "}
                // Обработчик
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const styles = {
  componentContainer: {
    border: "1px solid #ccc",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    backgroundColor: "#f5f5f5",
  },
  listItem: {
    listStyleType: "none",
    marginBottom: "5px",
  },
  button: {
    padding: "5px 10px",
    cursor: "pointer",
  },
};

export default ItemList;
