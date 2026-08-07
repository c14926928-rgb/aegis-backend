const express = require("express");
const router = express.Router();

const { EmbedBuilder } = require("discord.js");
const { client } = require("../bot");

router.post("/", async (req, res) => {

    try {

        const data = req.body;
        const type = data.type;

        const channel =
            await client.channels.fetch(
                process.env.ALERT_CHANNEL
            );

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
                        .addFields({
                            name: "Player",
                            value: data.player
                        });

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
                        {
                            name: "Player",
                            value: data.player,
                            inline: true
                        },
                        {
                            name: "Mode",
                            value: data.mode,
                            inline: true
                        },
                        {
                            name: "Operator",
                            value: "OP " + data.operator,
                            inline: true
                        }
                    );

                break;

            case "DEATH":

                embed
                    .setColor(0x992D22)
                    .setTitle("☠ Player Died")
                    .addFields(
                        {
                            name: "Player",
                            value: data.player
                        },
                        {
                            name: "Reason",
                            value: data.reason
                        }
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
                        {
                            name: "Player",
                            value: data.player
                        },
                        {
                            name: "Reason",
                            value: data.reason
                        }
                    );

                break;

            case "KICK":

                embed
                    .setColor(0xE67E22)
                    .setTitle("👢 Player Kicked")
                    .addFields(
                        {
                            name: "Player",
                            value: data.player
                        },
                        {
                            name: "Reason",
                            value: data.reason
                        }
                    );

                break;

            case "WARNING":

                embed
                    .setColor(0xF1C40F)
                    .setTitle("⚠ Cheat Detection")
                    .addFields(
                        {
                            name: "Player",
                            value: data.player,
                            inline: true
                        },
                        {
                            name: "Check",
                            value: data.check,
                            inline: true
                        },
                        {
                            name: "VL",
                            value: String(data.vl),
                            inline: true
                        },
                        {
                            name: "Debug",
                            value: "```" + (data.debug ?? "None") + "```"
                        }
                    );

                break;

            default:

                return res.status(400).json({
                    error: "Unknown log type"
                });

        }

        await channel.send({
            embeds: [embed]
        });

        res.sendStatus(200);

    } catch (err) {

        console.error(err);

        res.sendStatus(500);

    }

});

module.exports = router;

