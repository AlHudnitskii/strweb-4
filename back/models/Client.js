const db = require("../config/db");

db.run(
  `CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    contact TEXT
  )`,
  (err) => {
    if (err) {
      console.error("Ошибка создания таблицы clients:", err.message);
    } else {
      console.log("Таблица clients готова.");
    }
  },
);

module.exports = db;
