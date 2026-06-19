require("dotenv").config();

const express = require("express");
const app = express();

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
}, 15000);

// ===== START SERVER =====
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🔥 Running on port " + PORT);
});