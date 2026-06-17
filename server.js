const express = require("express");
const cors = require("cors");

// 🔥 FIX FETCH (Node 18+ safe)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

// ===== STORAGE =====
const frames = {};
const actions = [];

// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("🛡️ Aegis Backend Running");
});

// ===== HEALTH =====
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ===== RECEIVE FRAME =====
app.post("/frame", (req, res) => {
  const { player, image } = req.body;

  if (!player || !image) return res.sendStatus(400);

  frames[player] = image;

  console.log("📸 Frame recibido:", player);

  res.sendStatus(200);
});

// ===== GET FRAMES =====
app.get("/api/frames", (req, res) => {
  const output = {};

  for (const player in frames) {
    output[player] = `/frame/${player}`;
  }

  res.json(output);
});

// ===== SERVE IMAGE =====
app.get("/frame/:player", (req, res) => {
  const player = req.params.player;

  if (!frames[player]) return res.sendStatus(404);

  const img = Buffer.from(frames[player], "base64");

  res.writeHead(200, {
    "Content-Type": "image/jpeg",
    "Content-Length": img.length
  });

  res.end(img);
});

// ===== ACTION SYSTEM =====
app.post("/action", (req, res) => {
  actions.push(req.body);
  console.log("⚡ Acción recibida:", req.body);
  res.sendStatus(200);
});

app.get("/actions", (req, res) => {
  res.json(actions);
});

// ===== PORT =====
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Aegis Backend PRO Started");
  console.log("🔥 Running on port", PORT);
});

// ===== BOT LOAD (DESPUÉS DEL SERVER) =====
require("./bot");

// ===== KEEP ALIVE (FIX REAL) =====
setInterval(async () => {
  try {
    await fetch("https://aegis-backend-gwu4.onrender.com/health");
    console.log("🟢 KEEP ALIVE OK");
  } catch (e) {
    console.log("🔴 KEEP ALIVE ERROR");
  }
}, 150000);