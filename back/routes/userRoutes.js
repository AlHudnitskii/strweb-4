const express = require("express");
const router = express.Router();
const db = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const authenticateToken = require("../middleware/authMiddleware");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API для управления пользователями и авторизацией
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       401:
 *         description: Неавторизованный доступ
 */
router.get("/", authenticateToken, (req, res) => {
  db.all("SELECT id, username FROM users", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ users: rows });
    }
  });
});

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Зарегистрировать нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован
 *       400:
 *         description: Ошибка регистрации
 */
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID, username });
      }
    },
  );
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Авторизация успешна
 *       401:
 *         description: Неверные учетные данные
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, username: user.username });
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удалить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь удален
 *       404:
 *         description: Пользователь не найден
 *       401:
 *         description: Неавторизованный доступ
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Пользователь не найден" });
    } else {
      res.json({ message: "Пользователь удален" });
    }
  });
});

module.exports = router;
