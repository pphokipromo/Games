// src/index.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const registerSocketHandlers = require("./socket/handlers");

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const PORT = process.env.PORT || 4000;

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// ── SOCKET.IO ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

registerSocketHandlers(io);

// ── REST ENDPOINTS ───────────────────────────────────────────
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (_, res) => {
  res.json({ game: "Secret Mission Online", version: "1.0.0" });
});

// ── START ────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Secret Mission Online - Backend      ║
║   Running on port ${PORT}                 ║
║   Frontend: ${FRONTEND_URL}  ║
╚════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
