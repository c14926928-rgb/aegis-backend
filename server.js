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

// ===== AEGIS LOGS =====

app.post("/logs", async (req, res) => {

    try {

        const {
            type,
            player,
            check,
            vl,
            debug,
            server
        } = req.body;

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

            case "WARNING":

                embed
                    .setColor(0xF1C40F)
                    .setTitle("⚠️ Cheat Detection")
                    .addFields(
                        {
                            name: "Player",
                            value: player ?? "Unknown",
                            inline: true
                        },
                        {
                            name: "Check",
                            value: check ?? "Unknown",
                            inline: true
                        },
                        {
                            name: "VL",
                            value: String(vl ?? 0),
                            inline: true
                        },
                        {
                            name: "Server",
                            value: server ?? "Unknown",
                            inline: true
                        },
                        {
                            name: "Debug",
                            value: "```" + (debug ?? "None") + "```"
                        }
                    );

                break;

            case "KICK":

                embed
                    .setColor(0xE67E22)
                    .setTitle("👢 Player Kicked")
                    .setDescription("**" + player + "** was kicked by Aegis.")
                    .addFields(
                        {
                            name: "Check",
                            value: check ?? "Unknown",
                            inline: true
                        },
                        {
                            name: "VL",
                            value: String(vl ?? 0),
                            inline: true
                        }
                    );

                break;

            case "BAN":

                embed
                    .setColor(0xE74C3C)
                    .setTitle("🔨 Player Banned")
                    .setDescription("**" + player + "** was banned by Aegis.")
                    .addFields(
                        {
                            name: "Check",
                            value: check ?? "Unknown",
                            inline: true
                        },
                        {
                            name: "VL",
                            value: String(vl ?? 0),
                            inline: true
                        }
                    );

                break;

            case "JOIN":

                embed
                    .setColor(0x2ECC71)
                    .setTitle("🟢 Player Joined")
                    .setDescription("**" + player + "** joined the server.");

                break;

            case "LEAVE":

                embed
                    .setColor(0x95A5A6)
                    .setTitle("🔴 Player Left")
                    .setDescription("**" + player + "** left the server.");

                break;

            default:

                embed
                    .setColor(0x3498DB)
                    .setTitle("📨 Aegis")
                    .setDescription("Unknown event received.");

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