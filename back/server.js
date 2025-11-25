const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");
const googleAuthRoutes = require("./routes/googleAuth");
const clientRoutes = require("./routes/clientRoutes");
const newsRoutes = require("./routes/newsRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const authenticateToken = require("./middleware/authMiddleware");
const { swaggerUi, swaggerDocs } = require("./swagger");

dotenv.config();

require("./config/passport")(passport);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", userRoutes);
app.use("/auth", googleAuthRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/properties", propertyRoutes);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.redirect(`http://localhost:3000?token=${token}`);
  },
);

app.get("/auth/check", authenticateToken, (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
});

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка при выходе" });
    }
    res.json({ message: "Вы успешно вышли из системы" });
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Swagger доступен по адресу http://localhost:${PORT}/api-docs`);
});
