const db = require("../config/db");

db.run(
  `CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price REAL,
    location TEXT,
    type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  (err) => {
    if (err) {
      console.error("Ошибка создания таблицы properties:", err.message);
    } else {
      console.log("Таблица properties готова.");
    }
  },
);

module.exports = db;
