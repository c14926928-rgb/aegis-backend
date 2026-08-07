require("dotenv").config();
console.log("ALERT_CHANNEL:", process.env.ALERT_CHANNEL);

const express = require("express");
const app = express();
const { setFrame, getFrames } = require("./frames");
const { EmbedBuilder } = require("discord.js");

// FIX FETCH

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.use(express.json());

const logRoutes = require("./routes/logs");
const licenseRoutes = require("./routes/license");
const adminRoutes = require("./routes/admin");

app.use("/license", licenseRoutes);
console.log("✅ License routes mounted");

app.use("/admin", adminRoutes);

console.log("🚀 Aegis Backend Started");

// 🔥 IMPORTANTE → ARRANCA EL BOT
require("./bot");
const { client } = require("./bot");

// ===== START SERVER =====
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🔥 Running on port " + PORT);
});

// ===== KEEP ALIVE =====

setInterval(async () => {
  try {
    await fetch("https://aegis-backend-gwu4.onrender.com/");
    console.log("🟢 🛡️ Aegis Backend Running");
  } catch {
    console.log("🔴 KEEP ALIVE ERROR");
  }
}, 40000);

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

// ===== AEGIS LOGS =====

app.post("/logs", async (req, res) => {

    try {

     const data = req.body;

     const type = data.type;

        const channel = await client.channels.fetch(process.env.ALERT_CHANNEL);

        if (!channel) {
            return res.status(404).json({
                error: "Discord channel not found"
            });
        }

        const embed = new EmbedBuilder()
            .setTimestamp()
            .setFooter({
                text: "Conclave AegisAC"
            });

        switch (type) {

            case "OPERATOR":

    if (data.current > data.previous) {

        embed
            .setColor(0xFEE75C)
            .setTitle("🔑 Operator Granted")
            .addFields(
                {
                    name: "Player",
                    value: data.player
                },
                {
                    name: "New Level",
                    value: String(data.current)
                }
            );

    } else {

        embed
            .setColor(0x95A5A6)
            .setTitle("🔒 Operator Removed")
            .addFields(
                {
                    name: "Player",
                    value: data.player
                }
            );

    }

    break;

           case "ADVANCEMENT":

    embed
        .setColor(0xFEE75C)
        .setTitle("🏆 Advancement")
        .addFields(
            {
                name: "Player",
                value: data.player,
                inline: true
            },
            {
                name: "Advancement",
                value: data.advancement,
                inline: true
            }
        );

    break;

            case "RESPAWN":

    embed
        .setColor(0x57F287)
        .setTitle("♻ Player Respawned")
        .setDescription(`**${data.player}** respawned.`);

    break;

            case "GAMEMODE":

    embed
        .setColor(0x5865F2)
        .setTitle("🎮 GameMode Changed")
        .addFields(
            { name: "Player", value: data.player, inline: true },
            { name: "Mode", value: data.mode, inline: true },
            { name: "Operator", value: "OP " + data.operator, inline: true }
        );

    break;

            case "DEATH":

    embed
        .setColor(0x992D22)
        .setTitle("☠ Player Died")
        .addFields(
            { name: "Player", value: data.player },
            { name: "Reason", value: data.reason }
        );

    break;

            case "LEAVE":

    embed
        .setColor(0x95A5A6)
        .setTitle("🔴 Player Left")
        .setDescription(`**${data.player}** left the server.`);

    break;

            case "JOIN":

    embed
        .setColor(0x57F287)
        .setTitle("🟢 Player Joined")
        .setDescription(`**${data.player}** joined the server.`);

    break;

            case "BAN":

    embed
        .setColor(0xE74C3C)
        .setTitle("🔨 Player Banned")
        .addFields(
            { name: "Player", value: data.player },
            { name: "Reason", value: data.reason }
        );

    break;

case "KICK":

    embed
        .setColor(0xE67E22)
        .setTitle("👢 Player Kicked")
        .addFields(
            { name: "Player", value: data.player },
            { name: "Reason", value: data.reason }
        );

    break;

            case "WARNING":

    embed
        .setColor(0xF1C40F)
        .setTitle("⚠ Cheat Detection")
        .addFields(
            { name: "Player", value: data.player, inline: true },
            { name: "Check", value: data.check, inline: true },
            { name: "VL", value: String(data.vl), inline: true },
           {
    name: "Debug",
    value: "```" + (data.debug ?? "None") + "```"
}
        );

    break;

        }

        await channel.send({
            embeds: [embed]
        });

        res.sendStatus(200);

    } catch (err) {

        console.error("Discord Logs:", err);

        res.sendStatus(500);

    }
    

});

