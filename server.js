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
let lastAction = {};
let movements = {};
let linkedAccounts = {};
let frames = {};
let sessions = {};
let linkedServers = {};
let proxies = [
  { ip: "127.0.0.1:25565", busy: false }
];

// ================== HEARTBEAT ==================

app.post("/heartbeat", (req, res) => {
  let { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  serverId = serverId.trim();

  heartbeats[serverId] = Date.now();

  console.log("💓 Heartbeat:", serverId);

  res.sendStatus(200);
});

app.get("/status", (req, res) => {
  let { id } = req.query;

  if (!id) return res.json({ status: "disconnected" });

  id = id.trim();

  const last = heartbeats[id];

  if (!last) return res.json({ status: "disconnected" });

  const diff = Date.now() - last;

  if (diff > 5000) {
    return res.json({ status: "disconnected" });
  }

  res.json({ status: "connected" });
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

    console.log(`🟢 JOIN: ${name}`);
  }

  if (action === "LEAVE") {
    server.players = server.players.filter(p => p.name !== name);
    console.log(`🔴 LEAVE: ${name}`);
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

  if (!serverId) return res.sendStatus(400);

  if (!logs[serverId]) logs[serverId] = [];

  logs[serverId].push({ message, time: Date.now() });

  res.sendStatus(200);
});

app.get("/logs", (req, res) => {
  const { serverId } = req.query;
  res.json(logs[serverId] || []);
});

// ================== DETECTIONS ==================

app.post("/detection", (req, res) => {
  const { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  if (!detections[serverId]) detections[serverId] = [];

  detections[serverId].push(req.body);

  res.sendStatus(200);
});

app.get("/detections", (req, res) => {
  const { serverId } = req.query;
  res.json(detections[serverId] || []);
});

// ================== ALERTS ==================

app.post("/alert", (req, res) => {
  const { serverId } = req.body;

  if (!serverId) return res.sendStatus(400);

  if (!alerts[serverId]) alerts[serverId] = [];

  alerts[serverId].push({ ...req.body, time: Date.now() });

  res.sendStatus(200);
});

app.get("/alerts", (req, res) => {
  const { serverId } = req.query;
  res.json(alerts[serverId] || []);
});

// ================== BANS ==================

app.post("/ban", (req, res) => {
  const { serverId, name, uuid } = req.body;

  if (!serverId) return res.sendStatus(400);

  if (!bans[serverId]) bans[serverId] = [];

  bans[serverId].push({ name, uuid, time: Date.now() });

  res.sendStatus(200);
});

app.get("/bans", (req, res) => {
  const { serverId } = req.query;
  res.json(bans[serverId] || []);
});

// ================== ACTION SYSTEM ==================

app.post("/action", (req, res) => {
  const { type, player } = req.body;

  if (!type || !player) {
    return res.status(400).json({ error: "Missing data" });
  }

  lastAction = {
    type,
    player,
    time: Date.now()
  };

  console.log("🎯 ACTION SET:", lastAction);

  res.sendStatus(200);
});

app.get("/action", (req, res) => {

  if (!lastAction || Object.keys(lastAction).length === 0) {
    return res.json({ action: null }); // 🔥 NO ERROR
  }

  const action = lastAction;

  // limpiar después de leer
  lastAction = {};

  res.json({ action });
});

// ================== WEBHOOK ==================

async function sendDiscordAlert(serverId, message) {
  const webhook = webhooks[serverId];
  if (!webhook) return;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message })
    });
  } catch (err) {
    console.error("Webhook error:", err);
  }
}

app.post("/set-webhook", (req, res) => {
  const { serverId, webhook } = req.body;

  if (!webhook || !webhook.startsWith("https://discord.com/api/webhooks/")) {
    return res.status(400).send("Invalid webhook");
  }

  webhooks[serverId] = webhook;
  res.sendStatus(200);
});

// ================== LINK SYSTEM (FIX PRINCIPAL) ==================

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

  console.log("🛡️ LINKED:", serverId);

  res.json({ secureId });
});

// ================== GET SERVER ==================

app.get("/get-server", (req, res) => {
  const { serverId } = req.query;

  if (!servers[serverId]) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(servers[serverId]);
});

// ================== AUTO REGISTER/PROXYS ==================

app.post("/auto-register", (req, res) => {
  const { serverName, ip, port } = req.body;

  const serverId = "srv-" + Math.random().toString(36).substring(2, 10);

  servers[serverId] = {
    name: serverName,
    realIP: ip,
    port,
    status: "active"
  };

  console.log("⚡ AUTO REGISTER:", serverId);

  res.json({ serverId });
});

app.post("/assign-proxy", (req, res) => {
  const { serverId } = req.body;

  const proxy = proxies.find(p => !p.busy);

  if (!proxy) {
    return res.status(503).json({ error: "No proxies available" });
  }

  proxy.busy = true;

  servers[serverId].proxy = proxy.ip;

  console.log("🌐 PROXY ASSIGNED:", proxy.ip);

  res.json({ proxy: proxy.ip });
});

// ================== START ==================

app.listen(3000, () => {
  console.log("🚀 Running on port 3000");
});

require("./bot");