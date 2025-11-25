const express = require("express");
const db = require("../models/Client");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: API для управления клиентами
 */

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Получить список всех клиентов с возможностью поиска и сортировки
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Строка для поиска по имени клиента
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, name, contact]
 *         description: Поле для сортировки
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Порядок сортировки
 *     responses:
 *       200:
 *         description: Список клиентов
 */
router.get("/", (req, res) => {
  const { search, sortBy, order } = req.query;
  let query = "SELECT * FROM clients";
  const params = [];

  if (search) {
    query += " WHERE name LIKE ?";
    params.push(`%${search}%`);
  }

  if (sortBy) {
    const columns = ["id", "name", "contact"];
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
      res.json({ clients: rows });
    }
  });
});

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Получить клиента по ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID клиента
 *     responses:
 *       200:
 *         description: Информация о клиенте
 *       404:
 *         description: Клиент не найден
 */
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM clients WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: "Клиент не найден" });
    }
  });
});

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Создать нового клиента
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Клиент создан
 *       400:
 *         description: Недостаточно данных
 *       401:
 *         description: Неавторизованный доступ
 */
router.post("/", authenticateToken, (req, res) => {
  const { name, contact } = req.body;
  if (!name || !contact) {
    return res.status(400).json({ error: "Имя и контакт обязательны" });
  }

  db.run("INSERT INTO clients (name, contact) VALUES (?, ?)", [name, contact], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, name, contact });
    }
  });
});

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Обновить информацию о клиенте
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID клиента
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Клиент обновлен
 *       400:
 *         description: Недостаточно данных
 *       404:
 *         description: Клиент не найден
 *       401:
 *         description: Неавторизованный доступ
 */
router.put("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const { name, contact } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ error: "Имя и контакт обязательны" });
  }

  db.run(
    "UPDATE clients SET name = ?, contact = ? WHERE id = ?",
    [name, contact, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: "Клиент не найден" });
      } else {
        res.json({ id, name, contact });
      }
    },
  );
});

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Удалить клиента по ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID клиента
 *     responses:
 *       200:
 *         description: Клиент удален
 *       404:
 *         description: Клиент не найден
 *       401:
 *         description: Неавторизованный доступ
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM clients WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Клиент не найден" });
    } else {
      res.json({ message: "Клиент удален" });
    }
  });
});

module.exports = router;
