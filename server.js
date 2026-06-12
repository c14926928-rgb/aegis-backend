const express = require("express");
const cors = require("cors");

const app = express();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.use(cors());
app.use(express.json());

console.log("Conclave AegisAC Backend Loaded");

// ================== STORAGE ==================

let heartbeats = {};
let webhooks = {};
let servers = {};
let logs = {};
let detections = {};
let alerts = {};
let bans = {};
let actions = {};
let linkedAccounts = {};
let linkedServers = {};

let proxies = [
  { ip: "127.0.0.1:25565", busy: false }
];

// ================== HEARTBEAT ==================

app.post("/heartbeat", (req, res) => {
  let { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  heartbeats[serverId.trim()] = Date.now();
  res.sendStatus(200);
});

app.get("/status", (req, res) => {
  let { id } = req.query;

  if (!id || !heartbeats[id]) {
    return res.json({ status: "disconnected" });
  }

  const diff = Date.now() - heartbeats[id];
  res.json({ status: diff > 5000 ? "disconnected" : "connected" });
});

// ================== ROOT ==================

app.get("/", (req, res) => {
  res.send("Aegis Backend Running");
});

// ================== PLAYERS ==================

app.post("/player-event", (req, res) => {
  const { serverId, name, uuid, action, ip, license } = req.body;

  if (!serverId || !name) return res.sendStatus(400);

  if (!servers[serverId]) {
    servers[serverId] = { players: [] };
  }

  let server = servers[serverId];

  if (action === "JOIN") {
    server.players = server.players.filter(p => p.name !== name);
    server.players.push({
      name,
      uuid,
      ip: ip || "Unknown",
      license: license || "N/A",
      status: "ONLINE"
    });
  }

  if (action === "LEAVE") {
    server.players = server.players.filter(p => p.name !== name);
  }

  res.sendStatus(200);
});

app.get("/players", (req, res) => {
  const { serverId } = req.query;

  if (!servers[serverId]) return res.json([]);

  res.json(
    servers[serverId].players.map(p => ({
      ...p,
      discord: linkedAccounts[p.uuid] || "Not linked"
    }))
  );
});

// ================== LOGS ==================

app.post("/log", (req, res) => {
  const { serverId, message } = req.body;

  if (!serverId || !message) return res.sendStatus(400);

  if (!logs[serverId]) logs[serverId] = [];

  logs[serverId].unshift({
    message,
    time: Date.now()
  });

  res.sendStatus(200);
});

app.get("/logs", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !logs[serverId]) {
    return res.json([]);
  }

  res.json(logs[serverId]);
});

// ================== DETECTIONS ==================

app.get("/detections", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !detections[serverId]) {
    return res.json([]);
  }

  res.json(detections[serverId]);
});

// ================== ALERTS ==================

app.get("/alerts", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !alerts[serverId]) {
    return res.json([]);
  }

  res.json(alerts[serverId]);
});

// ================== BANS ==================

app.get("/bans", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !bans[serverId]) {
    return res.json([]);
  }

  res.json(bans[serverId]);
});

// ================== ACTION SYSTEM ==================

app.post("/action", (req, res) => {
  const { type, player, serverId } = req.body;

  if (!type || !player || !serverId) {
    return res.status(400).json({ error: "Missing data" });
  }

  actions[serverId] = {
    type,
    player,
    time: Date.now()
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
    console.error("ACTION ERROR:", err);
    res.status(500).json({ action: "none" });
  }
});
// ================== WEBHOOK ==================

app.post("/set-webhook", (req, res) => {
  const { serverId, webhook } = req.body;

  if (!webhook || !webhook.startsWith("https://discord.com/api/webhooks/")) {
    return res.status(400).send("Invalid webhook");
  }

  webhooks[serverId] = webhook;
  res.sendStatus(200);
});

// ================== LINK SYSTEM ==================

app.post("/link-server", (req, res) => {
  const { serverId, ip } = req.body;

  if (!serverId || !ip) {
    return res.status(400).json({ error: "Missing serverId or IP" });
  }

  const secureId = "aegis-" + Math.random().toString(36).substring(2, 10);

  servers[serverId] = {
    ...servers[serverId],
    realIP: ip,
    secureId,
    status: "protected"
  };

  linkedServers[serverId] = true;

  res.json({ secureId });
});

// ================== PROXY ==================

app.post("/assign-proxy", (req, res) => {
  const { serverId } = req.body;

  const proxy = proxies.find(p => !p.busy);

  if (!proxy) {
    return res.status(503).json({ error: "No proxies available" });
  }

  proxy.busy = true;

  servers[serverId].proxy = proxy.ip;

  res.json({ proxy: proxy.ip });
});

// ================== START ==================

app.listen(3000, () => {
  console.log("🚀 Running on port 3000");
});


require("./bot");