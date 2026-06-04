const express = require("express");
const cors = require("cors");
const CLIENT_ID = "1509684454002659499";
const CLIENT_SECRET = "Gfl1r7yoCl2AeWn8GgF1aYdi0aOFRsYS";
const REDIRECT_URI = "https://aegis-backend-gwu4.onrender.com/auth/callback";
const app = express();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


app.use(cors());
app.use(express.json());

console.log("Conclave AegisAC Backend Loaded");

// ================== STORAGE LET ==================

let heartbeats = {};
let webhooks = {};
let servers = {};
let logs = [];
let detections = [];
let alerts = [];
let bans = [];
let lastAction = {};
let movements = {};
let linkedAccounts = {};
let frames = {};
let sessions = {};
let linkedServers = {};

// ================== HEARTBEATS ==================

app.post("/heartbeat", (req, res) => {
  const { serverId } = req.body;

  heartbeats[serverId] = Date.now();

  res.sendStatus(200);
});

app.get("/status", (req, res) => {
  const { id } = req.query; // secureId

  const server = Object.values(servers).find(s => s.secureId === id);

  if (!server) {
    return res.json({ status: "disconnected" });
  }

  const serverId = Object.keys(servers).find(
    key => servers[key].secureId === id
  );

  const last = heartbeats[serverId];

  if (!last) {
    return res.json({ status: "disconnected" });
  }

  const diff = Date.now() - last;

  if (diff > 10000) {
    return res.json({ status: "disconnected" });
  }

  res.json({ status: "connected" });
});

// ================== ROOT ==================

app.get("/", (req, res) => {
  res.send("Conclave AegisAC Backend Running");
});

// ================== PLAYERS ==================

app.post("/player-event", (req, res) => {
  const { serverId, name, uuid, action, ip, discord, license } = req.body;

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

    console.log(`🟢 [${serverId}] JOIN:`, name);
  }

  if (action === "LEAVE") {
    server.players = server.players.filter(p => p.name !== name);
    console.log(`🔴 [${serverId}] LEAVE:`, name);
  }

  res.sendStatus(200);
});

app.get("/players", (req, res) => {
  const { serverId } = req.query;

  if (!serverId || !servers[serverId]) {
    return res.json([]);
  }

  res.json(
    servers[serverId].players.map(p => ({
      ...p,
      discord: linkedAccounts[p.uuid] || "Not linked"
    }))
  );
});


// ================== PANEL ==================



// ================== LOGS ==================

app.post("/log", (req, res) => {
  logs.push(req.body);
  console.log("📜 LOG:", req.body);
  res.sendStatus(200);
});

app.get("/logs", (req, res) => {
  res.json(logs);
});

// ================== DETECTIONS ==================

app.post("/detection", async (req, res) => {

  detections.push(req.body);

  const { player, check, vl, serverId } = req.body;

  console.log("🚨 DETECTION:", req.body);

  await sendDiscordAlert(
    serverId,
    `🚨 CHEAT DETECTED
Player: ${player}
Check: ${check}
VL: ${vl}`
  );
console.log(`📡 Alert sent for server ${serverId}`);
  res.sendStatus(200);
});

// ================== ALERTS ==================

app.post("/alert", (req, res) => {
  const { player, type, vl, severity } = req.body;

  const alert = { player, type, vl, severity, time: Date.now() };
  alerts.push(alert);

  console.log("⚠️ ALERT:", alert);

  res.sendStatus(200);
});

app.get("/alerts", (req, res) => {
  res.json(alerts);
});

async function sendDiscordAlert(serverId, message) {

  const webhook = webhooks[serverId];
  if (!webhook) return;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: message
      })
    });
  } catch (err) {
    console.error("Webhook error:", err);
  }
}

// ================== ACTIONS ==================

app.post("/action", (req, res) => {
  lastAction = req.body;
  console.log("🎯 ACTION:", lastAction);
  res.sendStatus(200);
});

app.get("/action", (req, res) => {
  res.json(lastAction);
  lastAction = {};
});

// ================== BANS ==================

app.post("/ban", (req, res) => {
  const { name, uuid } = req.body;

  const ban = { name, uuid, date: Date.now() };
  bans.push(ban);

  console.log("⛔ BAN:", ban);

  res.sendStatus(200);
});

app.get("/bans", (req, res) => {
  res.json(bans);
});

// ================== MOVEMENT ==================

app.post("/movement", (req, res) => {
  const { name, x, y, z, yaw, pitch } = req.body;
  movements[name] = { x, y, z, yaw, pitch, time: Date.now() };
  res.sendStatus(200);
});

app.get("/movement", (req, res) => {
  res.json(movements);
});

// ================== SCREEN CAPTURE ==================

let lastLog = 0;

app.post("/frame", (req, res) => {

  const serverId = req.query.serverId;

  if (!serverId) {
    return res.sendStatus(400);
  }

  let data = [];

  req.on("data", chunk => data.push(chunk));

  req.on("end", () => {

    if (Date.now() - lastLog > 10000) {
      console.log("📸 FRAME RECEIVED");
      lastLog = Date.now();
    }

    frames[serverId] = Buffer.concat(data);
    res.sendStatus(200);
  });

});

// ================== DISCORD LINK SYSTEM ==================



// ================== REGISTER SERVER ==================

app.post("/register-server", (req, res) => {
  const { serverId, name } = req.body;

  if (!servers[serverId]) {
    servers[serverId] = {
      name,
      players: []
    };
  }

  console.log("🧠 Registered server:", name, serverId);

  res.sendStatus(200);
});

app.post("/register-server-ip", (req, res) => {
 
  if (!ip || ip.length < 3) {
  return res.status(400).json({ error: "Invalid IP" });
}

  servers[serverId] = {
  ...servers[serverId],
  realIP: ip,
  secureId,
  status: "protected"
};

  servers[serverId].realIP = ip;
  servers[serverId].port = port;
  servers[serverId].proxy = "YOUR_VPS_IP:25565";

  console.log("🌐 Server IP registrada:", servers[serverId]);

  res.sendStatus(200);
});

app.post("/register-protection", (req, res) => {
  const { serverId, ip } = req.body;

  if (!ip || ip.length < 3) {
    return res.status(400).json({ error: "Invalid IP" });
  }

  const secureId = "aegis-" + Math.random().toString(36).substring(2, 10);

  servers[serverId] = {
    ...servers[serverId],
    realIP: ip,
    secureId,
    status: "protected"
  };

  console.log("🛡️ Server protegido:", servers[serverId]);

  res.json({ secureId });
});

// ================== VALIDATIONS ==================

app.get("/validate", (req, res) => {
  const { session, serverId } = req.query;

  if (!sessions[session]) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const user = sessions[session];

  if (!user.guilds.includes(serverId)) {
    return res.status(403).json({ error: "No access to this server" });
  }

  res.json({ success: true, user });
});

// ================== WEBHOOKS ==================

app.post("/set-webhook", (req, res) => {
  const { serverId, webhook } = req.body;

  if (!webhook.startsWith("https://discord.com/api/webhooks/")) {
    return res.status(400).send("Invalid webhook");
  }

  webhooks[serverId] = webhook; 

  console.log("🔗 Webhook guardado para", serverId);

  res.sendStatus(200);
});

// ================== PROXY ==================

app.get("/get-proxy", (req, res) => {
  const { serverId } = req.query;

  if (!servers[serverId]) {
    return res.status(404).send("No server");
  }

  res.json({
    proxy: servers[serverId].proxy || "Not assigned yet"
  });
});

app.get("/get-server", (req, res) => {
  const { serverId } = req.query;

  if (!servers[serverId]) {
    return res.status(404).send("Not found");
  }

  res.json(servers[serverId]);
});

// ================== START ==================

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});

// ================== BOTS ==================

require("./bot");