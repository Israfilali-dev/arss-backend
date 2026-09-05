require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { sequelize } = require("./src/models");
const apiRoutes = require("./src/routes");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const app = express();

// --- Core middleware ---
app.use(
  helmet({
    contentSecurityPolicy: false, // the Tailwind CDN script needs this off; fine for this project's scale
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true, // frontend is now same-origin, so this mainly matters if you ever split them again
    credentials: true,
  })
);

// Basic protection against brute-forcing the admin login.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many attempts. Please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);

// --- Health check (useful for host uptime checks) ---
app.get("/health", (req, res) => res.json({ status: "ok" }));

// --- API routes ---
app.use("/api", apiRoutes);

// --- Serve the frontend (index.html, admin.html, script.js, style.css) ---
app.use(express.static(path.join(__dirname, "public")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    // Creates/updates tables to match the models. Safe to run repeatedly;
    // switch to real Sequelize migrations if the schema needs to evolve
    // without risking data loss on a production database later on.
    await sequelize.sync({ alter: true });
    console.log("Database synced.");

    app.listen(PORT, () => {
      console.log(`ARSS Entertainment API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

module.exports = app;
