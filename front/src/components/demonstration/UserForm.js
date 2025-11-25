import React, { Component } from "react";

class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = { username: "", email: "" };

    // Привязка методов к текущему экземпляру
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Обработчик изменения полей ввода
   * @param {object} event - Событие изменения поля
   */
  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  /**
   * Обработчик отправки формы
   * @param {object} event - Событие отправки формы
   */
  handleSubmit(event) {
    event.preventDefault();
    alert(`Имя: ${this.state.username}, Email: ${this.state.email}`);
  }

  render() {
    return (
      <div style={styles.componentContainer}>
        <h3>Форма пользователя</h3>
        <form onSubmit={this.handleSubmit}>
          <div style={styles.formGroup}>
            <label>
              Имя:
              <input
                type="text"
                name="username"
                value={this.state.username}
                onChange={this.handleChange}
                placeholder="Введите имя"
                style={styles.input}
                required
              />
            </label>
          </div>
          <div style={styles.formGroup}>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={this.state.email}
                onChange={this.handleChange}
                placeholder="Введите email"
                style={styles.input}
                required
              />
            </label>
          </div>
          <button type="submit" style={styles.button}>
            Отправить
          </button>
        </form>
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
    backgroundColor: "#fff5f5",
  },
  formGroup: {
    marginBottom: "10px",
  },
  input: {
    marginLeft: "10px",
    padding: "5px",
    borderRadius: "3px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "5px 15px",
    cursor: "pointer",
  },
};

export default UserForm;
