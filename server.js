require("dotenv").config();
console.log("ALERT_CHANNEL:", process.env.ALERT_CHANNEL);

const express = require("express");
const app = express();
const { setFrame, getFrames } = require("./frames");
const { EmbedBuilder } = require("discord.js");

// FIX FETCH

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.use(express.json());

console.log("🚀 Aegis Backend Started");

// 🔥 IMPORTANTE → ARRANCA EL BOT
require("./bot");
const { client } = require("./bot");

// ===== ROUTE TEST =====

app.get("/", (req, res) => {
  res.send("Aegis Backend Online");
});

// ===== KEEP ALIVE =====

//OFFLINE

// ===== START SERVER =====
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🔥 Running on port " + PORT);
});

// ===== KEEP ALIVE =====

app.get("/", (req, res) => {
    res.status(200).send("🛡️ Aegis Backend Online");
});

app.get("/health", (req, res) => {
    res.json({
        status: "online",
        service: "Aegis Backend",
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

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

//ALERTS 

app.post("/alert", async (req, res) => {

    try {

        const {
            player,
            check,
            vl,
            action,
            debug
        } = req.body;

        const channel = await client.channels.fetch(process.env.ALERT_CHANNEL);

        const embed = new EmbedBuilder()
            .setTitle("🛡️ Aegis Alert")
            .setColor(0xffaa00)
            .addFields(
                { name: "Player", value: player, inline: true },
                { name: "Check", value: check, inline: true },
                { name: "VL", value: String(vl), inline: true },
                { name: "Action", value: action },
                { name: "Debug", value: debug ?? "None" }
            )
            .setTimestamp();

        await channel.send({
            embeds: [embed]
        });

        res.sendStatus(200);

    } catch (err) {

        console.error(err);

        res.sendStatus(500);

    }

});