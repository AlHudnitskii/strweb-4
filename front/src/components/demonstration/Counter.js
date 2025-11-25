import React, { Component } from "react";

class Counter extends Component {
  // Классовый компонент
  constructor(props) {
    super(props);
    this.state = { count: 0 }; // Работа со state

    // Привязка методов к текущему экземпляру
    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
    this.reset = this.reset.bind(this);
  }

  increment() {
    this.setState((prevState) => ({ count: prevState.count + 1 }));
  }

  decrement() {
    this.setState((prevState) => ({ count: prevState.count - 1 }));
  }

  reset() {
    this.setState({ count: 0 });
  }

  render() {
    return (
      <div style={styles.componentContainer}>
        <h3>Счётчик: {this.state.count}</h3> // State
        <button onClick={this.increment} style={styles.button}>
          {" "}
          // Обработчик Увеличить
        </button>
        <button onClick={this.decrement} style={styles.button}>
          Уменьшить
        </button>
        <button onClick={this.reset} style={styles.button}>
          Сбросить
        </button>
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
    backgroundColor: "#f1f1f1",
  },
  button: {
    padding: "5px 10px",
    margin: "5px",
    cursor: "pointer",
  },
};

export default Counter;
