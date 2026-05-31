const express = require("express");
const cors = require("cors");
const CLIENT_ID = "1509684454002659499";
const CLIENT_SECRET = "Gfl1r7yoCl2AeWn8GgF1aYdi0aOFRsYS";
const REDIRECT_URI = "https://aegis-backend-gwu4.onrender.com/auth/callback";
const app = express();
const fetch = require("node-fetch");


app.use(cors());
app.use(express.json());

console.log("Conclave AegisAC Backend Loaded");

// ================== STORAGE ==================

let webhooks = {};
let servers = {};
let logs = [];
let detections = [];
let alerts = [];
let bans = [];
let lastAction = {};
let movements = {};
let linkedAccounts = {};
let linkCodes = {};
let frames = {};
let sessions = {};

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
 if (!serverId) {
  return res.sendStatus(400);
} 

  let data = [];

  req.on("data", chunk => data.push(chunk));

    if (Date.now() - lastLog > 10000) {
      console.log("📸 FRAME RECEIVED");
      lastLog = Date.now();
    }
     req.on("end", () => {
    frames[serverId] = Buffer.concat(data);
    res.sendStatus(200);
  });
});

app.get("/frame", (req, res) => {
  const { serverId } = req.query;

  if (!frames[serverId]) {
    return res.status(404).send("No frame");
  }

  res.setHeader("Content-Type", "image/jpeg");
  res.end(frames[serverId]);
});

// ================== DISCORD LINK SYSTEM ==================

app.post("/link", (req, res) => {
  const { code } = req.body;

  if (!linkCodes[code]) {
    return res.status(404).json({ error: "Invalid code" });
  }

  const serverId = linkCodes[code].guildId;

  delete linkCodes[code];

  res.json({ serverId });
});

app.post("/generate-link", (req, res) => {
  const { uuid } = req.body;

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  linkCodes[code] = { uuid };

  console.log("🔗 LINK CODE:", code, "for", uuid);

  res.json({ code });
});

app.post("/confirm-link", (req, res) => {
  const { code, discordId } = req.body;

  if (!linkCodes[code]) {
    return res.status(400).json({ error: "Invalid code" });
  }

  const uuid = linkCodes[code].uuid;

  linkedAccounts[uuid] = discordId;
  delete linkCodes[code];

  console.log("✅ LINKED:", uuid, "->", discordId);

  res.sendStatus(200);
});

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

  console.log("🔗 Webhook guardado para", serverId);

  res.sendStatus(200);
});


// ================== START ==================

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});

// ================== BOTS ==================

require("./bot");