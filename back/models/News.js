const db = require("../config/db");

db.run(
  `CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    date TEXT
  )`,
  (err) => {
    if (err) {
      console.error("Ошибка создания таблицы news:", err.message);
    } else {
      console.log("Таблица news готова.");
    }
  },
);

module.exports = db;
