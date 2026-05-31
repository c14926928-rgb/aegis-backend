const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
//====== SERVERS ======

const servers = new Map();
client.on("guildCreate", async (guild) => {
    console.log(" Nuevo servidor:", guild.name);

    try {
        await fetch("https://aegis-backend-gwu4.onrender.com/register-server", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                serverId: guild.id,
                name: guild.name
            })
        });

        console.log(" Server registrado en backend");

    } catch (err) {
        console.log(" Error registrando server");
        console.error(err);
    }
});

//====== MESAGGES ======

const pendingLinks = new Map();

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  // COMANDO LINK
  if (message.content === "!link") {

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    pendingLinks.set(code, {
      guildId: message.guild.id
    });

    message.reply(`🔗 Código de vinculación:\n${code}\nPon esto en el mod.`);
  }

  // 🔥 COMANDO PANEL
  if (message.content === "!panel") {

    const link = `https://aegis-dashboard.vercel.app/?server=${message.guild.id}`;

    message.reply(`🖥 Panel:\n${link}`);
  }
});

//====== LINKS ======

const pendingLinks = new Map();

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.content === "!link") {

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        pendingLinks.set(code, {
            guildId: message.guild.id
        });

        message.reply(`🔗 Código de vinculación:\n${code}\nPon esto en el mod.`);
    }
});

//====== TOKEN ======

client.login(process.env.TOKEN);
