const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

console.log("🚀 Aegis Backend v2 Started");

// ================== STORAGE ==================

let heartbeats = {};
let actions = {};
let logs = {};

// ================== HEALTH ==================

app.get("/", (req, res) => {
  res.send("Aegis Backend Running ✅");
});

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

// ================== HEARTBEAT ==================

app.post("/heartbeat", (req, res) => {
  const { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  heartbeats[serverId] = Date.now();

  console.log("💓 HEARTBEAT:", serverId);

  res.sendStatus(200);
});

app.get("/status", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !heartbeats[serverId]) {
    return res.json({ status: "offline" });
  }

  const diff = Date.now() - heartbeats[serverId];

  res.json({
    status: diff < 10000 ? "online" : "offline",
    lastSeen: heartbeats[serverId]
  });
});

// ================== ACTION SYSTEM ==================

app.post("/action", (req, res) => {
  const { serverId, type, player } = req.body;

  if (!serverId || !type || !player) {
    return res.status(400).json({ error: "Missing data" });
  }

  actions[serverId] = {
    id: Date.now(),
    type,
    player
  };

  console.log("🎯 ACTION SET:", actions[serverId]);

  res.json({ success: true });
});

app.get("/action", (req, res) => {
  try {
    const { serverId } = req.query;

    if (!serverId || !actions[serverId]) {
      return res.json({ action: "none" });
    }

    const action = actions[serverId];

    delete actions[serverId];

    res.json({ action });

  } catch (err) {
    console.error("❌ ACTION ERROR:", err);
    res.json({ action: "none" });
  }
});

// ================== LOG SYSTEM ==================

app.post("/log", (req, res) => {
  const { serverId, message } = req.body;

  if (!serverId || !message) return res.sendStatus(400);

  if (!logs[serverId]) logs[serverId] = [];

  logs[serverId].unshift({
    message,
    time: Date.now()
  });

  if (logs[serverId].length > 100) {
    logs[serverId].pop();
  }

  res.sendStatus(200);
});

app.get("/logs", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !logs[serverId]) {
    return res.json([]);
  }

  res.json(logs[serverId]);
});

// ================== FRAME (ANTI CRASH) ==================

app.post("/frame", (req, res) => {
  res.sendStatus(200);
});

// ================== START ==================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Running on port ${PORT}`);
});