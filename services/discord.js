const { EmbedBuilder } = require("discord.js");
const { client } = require("../bot");

async function sendLog(data) {

    const channel =
        await client.channels.fetch(
            process.env.ALERT_CHANNEL
        );

    if (!channel) {
        throw new Error("Discord channel not found.");
    }

    const embed = new EmbedBuilder()
        .setTimestamp()
        .setFooter({
            text: "Conclave AegisAC"
        });

    switch (data.type) {

        // Aquí moveremos TODOS los cases
        // OPERATOR
        // JOIN
        // LEAVE
        // WARNING
        // BAN
        // etc...

    }

    await channel.send({
        embeds: [embed]
    });

}

module.exports = {

    sendLog

};