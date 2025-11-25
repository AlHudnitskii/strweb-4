const express = require("express");
const db = require("../models/News");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: News
 *   description: API для управления новостями
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Получить список всех новостей с возможностью поиска и сортировки
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Строка для поиска по заголовку новости
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, title, date]
 *         description: Поле для сортировки
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Порядок сортировки
 *     responses:
 *       200:
 *         description: Список новостей
 */
router.get("/", (req, res) => {
  const { search, sortBy, order } = req.query;
  let query = "SELECT * FROM news";
  const params = [];

  if (search) {
    query += " WHERE title LIKE ?";
    params.push(`%${search}%`);
  }

  if (sortBy) {
    const columns = ["id", "title", "date"];
    if (columns.includes(sortBy)) {
      query += ` ORDER BY ${sortBy}`;
      if (order && (order.toLowerCase() === "asc" || order.toLowerCase() === "desc")) {
        query += ` ${order.toUpperCase()}`;
      }
    }
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ news: rows });
    }
  });
});

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Получить новость по ID
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID новости
 *     responses:
 *       200:
 *         description: Информация о новости
 *       404:
 *         description: Новость не найдена
 */
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM news WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: "Новость не найдена" });
    }
  });
});

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Создать новую новость
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Новость создана
 *       400:
 *         description: Недостаточно данных
 *       401:
 *         description: Неавторизованный доступ
 */
router.post("/", authenticateToken, (req, res) => {
  const { title, content, date } = req.body;
  if (!title || !content || !date) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  db.run(
    "INSERT INTO news (title, content, date) VALUES (?, ?, ?)",
    [title, content, date],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID, title, content, date });
      }
    },
  );
});

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Обновить информацию о новости
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID новости
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новость обновлена
 *       400:
 *         description: Недостаточно данных
 *       404:
 *         description: Новость не найдена
 *       401:
 *         description: Неавторизованный доступ
 */
router.put("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const { title, content, date } = req.body;

  if (!title || !content || !date) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  db.run(
    "UPDATE news SET title = ?, content = ?, date = ? WHERE id = ?",
    [title, content, date, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: "Новость не найдена" });
      } else {
        res.json({ id, title, content, date });
      }
    },
  );
});

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Удалить новость по ID
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID новости
 *     responses:
 *       200:
 *         description: Новость удалена
 *       404:
 *         description: Новость не найдена
 *       401:
 *         description: Неавторизованный доступ
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM news WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Новость не найдена" });
    } else {
      res.json({ message: "Новость удалена" });
    }
  });
});

module.exports = router;
