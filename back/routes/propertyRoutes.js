const express = require("express");
const db = require("../models/Property");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: API для управления объектами недвижимости
 */

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Получить список всех объектов недвижимости с возможностью поиска и сортировки
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Строка для поиска по заголовку объекта недвижимости
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, title, price, location, type]
 *         description: Поле для сортировки
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Порядок сортировки
 *     responses:
 *       200:
 *         description: Список объектов недвижимости
 */
router.get("/", (req, res) => {
  const { search, sortBy, order } = req.query;
  let query = "SELECT * FROM properties";
  const params = [];

  if (search) {
    query += " WHERE title LIKE ?";
    params.push(`%${search}%`);
  }

  if (sortBy) {
    const columns = ["id", "title", "price", "location", "type"];
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
      res.json({ properties: rows });
    }
  });
});

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Получить объект недвижимости по ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID объекта недвижимости
 *     responses:
 *       200:
 *         description: Информация об объекте недвижимости
 *       404:
 *         description: Объект недвижимости не найден
 */
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM properties WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: "Объект недвижимости не найден" });
    }
  });
});

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Создать новый объект недвижимости
 *     tags: [Properties]
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
 *               price:
 *                 type: number
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Объект недвижимости создан
 *       400:
 *         description: Недостаточно данных
 *       401:
 *         description: Неавторизованный доступ
 */
router.post("/", authenticateToken, (req, res) => {
  const { title, price, location, type } = req.body;
  if (!title || !price || !location || !type) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  const query = "INSERT INTO properties (title, price, location, type) VALUES (?, ?, ?, ?)";
  const params = [title, price, location, type];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      db.get("SELECT * FROM properties WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(201).json(row);
        }
      });
    }
  });
});

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Обновить информацию об объекте недвижимости
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID объекта недвижимости
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Объект недвижимости обновлен
 *       400:
 *         description: Недостаточно данных
 *       404:
 *         description: Объект недвижимости не найден
 *       401:
 *         description: Неавторизованный доступ
 */
router.put("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const { title, price, location, type } = req.body;

  if (!title || !price || !location || !type) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  const query = `
    UPDATE properties
    SET title = ?, price = ?, location = ?, type = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;
  const params = [title, price, location, type, id];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Объект недвижимости не найден" });
    } else {
      db.get("SELECT * FROM properties WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json(row);
        }
      });
    }
  });
});

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Удалить объект недвижимости по ID
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID объекта недвижимости
 *     responses:
 *       200:
 *         description: Объект недвижимости удален
 *       404:
 *         description: Объект недвижимости не найден
 *       401:
 *         description: Неавторизованный доступ
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM properties WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Объект недвижимости не найден" });
    } else {
      res.json({ message: "Объект недвижимости удален" });
    }
  });
});

module.exports = router;
