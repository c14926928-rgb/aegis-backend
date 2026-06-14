const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

console.log("🚀 Backend started");

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.send("Backend OK");
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Running on port", PORT);
});

// ===== LOAD BOT =====
require("./bot");
console.log("🤖 Bot loading...");