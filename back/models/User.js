const db = require("../config/db");

db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    googleId TEXT UNIQUE,
    facebookId TEXT UNIQUE
  )`,
  (err) => {
    if (err) {
      console.error("Ошибка создания таблицы users:", err.message);
    } else {
      console.log("Таблица users готова.");
    }
  },
);

module.exports = db;
