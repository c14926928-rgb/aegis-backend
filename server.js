require("dotenv").config();

const express = require("express");
const app = express();
const { setFrame, getFrames } = require("./frames");

// FIX FETCH

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.use(express.json());

console.log("🚀 Aegis Backend Started");

// 🔥 IMPORTANTE → ARRANCA EL BOT
require("./bot");

// ===== ROUTE TEST =====

app.get("/", (req, res) => {
  res.send("Aegis Backend Online");
});

// ===== KEEP ALIVE =====

setInterval(async () => {
  try {
    await fetch("https://aegis-backend-gwu4.onrender.com/");
    console.log("🟢 KEEP ALIVE");
  } catch {
    console.log("🔴 KEEP ALIVE ERROR");
  }
}, 40000);

// ===== START SERVER =====
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🔥 Running on port " + PORT);
});

// ===== KEEP ALIVE =====

app.get("/frames/:serverId", (req, res) => {
  res.json(getFrames(req.params.serverId));
});

app.post("/frame", (req, res) => {
  const { serverId, player, image } = req.body;

  if (!serverId || !player || !image) {
    return res.status(400).send("bad");
  }

  setFrame(serverId, player, image);

  res.send("ok");
});