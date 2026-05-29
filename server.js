const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 Aegis Backend Loaded");

// ================== STORAGE ==================

let players = [];
let logs = [];
let detections = [];
let alerts = [];
let bans = [];
let lastAction = {};
let movements = {};
let lastLogTime = 0;
let linkCodes = {}; 
let linkedAccounts = {}; 
// ================== ROOT ==================

app.get("/", (req, res) => {
  res.send("Aegis Backend Running");
});

// ================== PLAYERS ==================

app.post("/player-event", (req, res) => {
  const { name, uuid, action, ip, discord, license } = req.body;

  if (action === "JOIN") {
    players = players.filter(p => p.name !== name);

    players.push({
      name,
      uuid,
      ip: ip || "Unknown",
      discord: discord || "Not linked",
      license: license || "N/A",
      status: "ONLINE"
    });

    console.log("🟢 JOIN:", name);
  }

  if (action === "LEAVE") {
    players = players.filter(p => p.name !== name);
    console.log("🔴 LEAVE:", name);
  }

  res.sendStatus(200);
});


app.get("/players", (req, res) => {
  res.json(players);
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

app.post("/frame", (req, res) => {
  let data = [];

  req.on("data", chunk => data.push(chunk));

  req.on("end", () => {
    lastFrame = Buffer.concat(data);

    const now = Date.now();

    if (now - lastLogTime > 10 * 60 * 1000) {
      console.log("📸 FRAME RECEIVED");
      lastLogTime = now;
    }

    res.sendStatus(200);
  });
});
// ================== DETECTIONS ==================

app.post("/detection", (req, res) => {
  detections.push(req.body);

  console.log("🚨 DETECTION:", req.body);

  res.sendStatus(200);
});

app.get("/detections", (req, res) => {
  res.json(detections);
});

// ================== ALERTS ==================

app.post("/alert", (req, res) => {
  const { player, type, vl, severity } = req.body;

  const alert = {
    player,
    type,
    vl,
    severity,
    time: Date.now()
  };

  alerts.push(alert);

  console.log("⚠️ ALERT:", alert);

  res.sendStatus(200);
});

app.get("/alerts", (req, res) => {
  res.json(alerts);
});

// ================== ACTIONS ==================

app.post("/action", (req, res) => {
  lastAction = req.body;

  console.log("🎯 ACTION:", lastAction);

  res.sendStatus(200);
});

app.get("/action", (req, res) => {
  res.json(lastAction);

  // limpiar después de enviar
  lastAction = {};
});

// ================== BANS ==================

app.post("/ban", (req, res) => {
  const { name, uuid } = req.body;

  const ban = {
    name,
    uuid,
    date: Date.now()
  };

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

let lastFrame = null;

app.post("/frame", (req, res) => {
  let data = [];

  req.on("data", chunk => data.push(chunk));

  req.on("end", () => {
    lastFrame = Buffer.concat(data);
    console.log("📸 FRAME RECEIVED");
    res.sendStatus(200);
  });
});

app.get("/frame", (req, res) => {
  if (!lastFrame) {
    return res.status(404).send("No frame yet");
  }

  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Content-Length", lastFrame.length);
  res.setHeader("Cache-Control", "no-cache");

  res.end(lastFrame); // usar end en vez de send
});

// ================== DISCORD LINK ==================

app.post("/generate-link", (req, res) => {
  const { uuid } = req.body;

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  linkCodes[code] = uuid;

  console.log("🔗 LINK CODE:", code, "for", uuid);

  res.json({ code });
});

app.post("/confirm-link", (req, res) => {
  const { code, discordId } = req.body;

  const uuid = linkCodes[code];

  if (!uuid) {
    return res.status(400).json({ error: "Invalid code" });
  }

  linkedAccounts[uuid] = discordId;
  delete linkCodes[code];

  console.log("✅ LINKED:", uuid, "->", discordId);

  res.sendStatus(200);
  
  require("./bot");
});

// ================== START SERVER ==================

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});

// ================== DISCORD BOT ==================

require("./bot");