const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();

app.use(cors());
app.use(express.raw({ type: 'image/jpeg', limit: '1mb' }));

console.log("🚀 Aegis Backend PRO Started");

setInterval(async () => {
  try {
    const res = await fetch("https://aegis-backend-gwu4.onrender.com");
    console.log("🟢 KEEP ALIVE OK");
  } catch (e) {
    console.log("🔴 KEEP ALIVE ERROR");
  }
}, 150000); 

// ================== STORAGE ==================

let heartbeats = {};
let actions = {};
let logs = {};
let detections = {};
let alerts = {};
let bans = {};
let players = {};
let movements = {};

// ================== ROOT ==================

app.get("/", (req, res) => {
  res.send("Aegis Backend Running ✅");
});

// ================== HEARTBEAT ==================

app.post("/heartbeat", (req, res) => {
  const { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  heartbeats[serverId] = Date.now();

  res.sendStatus(200);
});

app.get("/status", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !heartbeats[serverId]) {
    return res.json({ status: "offline" });
  }

  const diff = Date.now() - heartbeats[serverId];

  res.json({
    status: diff < 10000 ? "online" : "offline"
  });
});

// ================== ACTION SYSTEM ==================

app.post("/action", (req, res) => {
  const { serverId, type, player } = req.body;

  if (!serverId || !type || !player) {
    return res.status(400).json({ error: "Missing data" });
  }

  actions[serverId] = {
    type,
    player,
    time: Date.now()
  };

  console.log("🎯 ACTION:", actions[serverId]);

  res.json({ success: true });
});

app.get("/action", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !actions[serverId]) {
    return res.json({ action: "none" });
  }

  const action = actions[serverId];
  delete actions[serverId];

  res.json({ action });
});

// ================== LOGS ==================

app.post("/log", (req, res) => {
  const { serverId, message } = req.body;

  if (!serverId || !message) return res.sendStatus(400);

  if (!logs[serverId]) logs[serverId] = [];

  logs[serverId].unshift({ message, time: Date.now() });

  if (logs[serverId].length > 100) logs[serverId].pop();

  res.sendStatus(200);
});

app.get("/logs", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !logs[serverId]) return res.json([]);

  res.json(logs[serverId]);
});

// ================== DETECTIONS ==================

app.post("/detection", (req, res) => {
  const { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  if (!detections[serverId]) detections[serverId] = [];

  detections[serverId].unshift({
    ...req.body,
    time: Date.now()
  });

  if (detections[serverId].length > 100) detections[serverId].pop();

  console.log("⚠️ DETECTION:", req.body);

  res.sendStatus(200);
});

app.get("/detections", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !detections[serverId]) return res.json([]);

  res.json(detections[serverId]);
});

// ================== ALERTS ==================

app.post("/alert", (req, res) => {
  const { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  if (!alerts[serverId]) alerts[serverId] = [];

  alerts[serverId].unshift({
    ...req.body,
    time: Date.now()
  });

  if (alerts[serverId].length > 100) alerts[serverId].pop();

  res.sendStatus(200);
});

app.get("/alerts", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !alerts[serverId]) return res.json([]);

  res.json(alerts[serverId]);
});

// ================== BANS ==================

app.post("/ban", (req, res) => {
  const { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  if (!bans[serverId]) bans[serverId] = [];

  bans[serverId].unshift({
    ...req.body,
    time: Date.now()
  });

  if (bans[serverId].length > 100) bans[serverId].pop();

  console.log("🔨 BAN:", req.body);

  res.sendStatus(200);
});

app.get("/bans", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !bans[serverId]) return res.json([]);

  res.json(bans[serverId]);
});

// ================== PLAYERS ==================

app.post("/player-event", (req, res) => {
  const { serverId, name, action } = req.body;

  if (!serverId || !name) return res.sendStatus(400);

  if (!players[serverId]) players[serverId] = [];

  if (action === "JOIN") {
    players[serverId].push({ name, time: Date.now() });
  }

  if (action === "LEAVE") {
    players[serverId] = players[serverId].filter(p => p.name !== name);
  }

  res.sendStatus(200);
});

app.get("/players", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !players[serverId]) return res.json([]);

  res.json(players[serverId]);
});

// ================== MOVEMENTS ==================

app.post("/movement", (req, res) => {
  const { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  if (!movements[serverId]) movements[serverId] = [];

  movements[serverId].push(req.body);

  if (movements[serverId].length > 200) movements[serverId].shift();

  res.sendStatus(200);
});

app.get("/movement", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !movements[serverId]) return res.json([]);

  res.json(movements[serverId]);
});

// ================== FRAME ==================

// 🔥 almacenamiento en memoria
const frames = {};

// 📤 RECIBE FRAME
app.post('/frame', (req, res) => {

    const player = req.headers['player'];

    if (!player) return res.sendStatus(400);

    frames[player] = {
        data: req.body,
        time: Date.now()
    };

    res.sendStatus(200);
});

// 📥 FRAME INDIVIDUAL (MOD)
app.get('/api/frame/:player', (req, res) => {

    const f = frames[req.params.player];

    if (!f) return res.sendStatus(404);

    res.set('Content-Type', 'image/jpeg');
    res.send(f.data);
});

// 📥 TODOS LOS FRAMES (WEB)
app.get('/api/frames', (req, res) => {

    const result = {};

    for (const p in frames) {
        result[p] = `/api/frame/${p}`;
    }

    res.json(result);
});

// ================== START ==================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Running on port", PORT);
});

// ================== BOT ==================

require("./bot");
console.log("🤖 Bot loaded");