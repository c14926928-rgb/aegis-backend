const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let lastServerId = null;

//====== READY ======

client.once("ready", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const commands = [
  {
    name: "help",
    description: "Show help menu"
  },
  {
    name: "panel",
    description: "Open dashboard"
  },
  {
  name: "link",
  description: "Protect your server",
  options: [
    {
      name: "ip",
      type: 3,
      description: "Server IP",
      required: true
    }
  ]
  },
  {
    name: "webhook",
    description: "Set webhook",
    options: [
      {
        name: "url",
        type: 3,
        description: "Webhook URL",
        required: true
      }
    ]
  }
];




  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered");
  } catch (err) {
    console.error(err);
  }
});

//====== AUTO REGISTER SERVER ======

client.on("guildCreate", async (guild) => {
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
  } catch (err) {
    console.error(err);
  }
});

//====== COMMANDS ======

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ===== HELP =====
 
  if (interaction.commandName === "help") {

    const embed = new EmbedBuilder()
      .setTitle("🛡️ Conclave AegisAC • Anti-Cheat")
      .setColor(0x6c5ce7)
      .setDescription("Real-time anti-cheat system for Minecraft servers.")
      .addFields(
        { name: "📌 Commands", value: "/webhook\n/link\n/panel" },
        { name: "⚙️ Setup", value: "1. /webhook\n2. /link\n3. /link CODE\n4. /panel" }
      );

    return interaction.reply({
      embeds: [embed],
      flags: 64
    });
  }

// ===== LINK =====

if (interaction.commandName === "link") {

  const ip = interaction.options.getString("ip");

  const serverId = interaction.guild.id;

  lastServerId = serverId; 
  
  const res = await fetch("https://aegis-backend-gwu4.onrender.com/link-server", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ serverId, ip })
  });

  await interaction.reply({
    content: `
🛡️ Server Linked

📡 IP: ${ip}
🆔 Server ID: ${serverId}
`,
    flags: 64
  });
}

// ===== PANEL =====

if (interaction.commandName === "panel") {

  try {

    const res = await fetch(
      `https://aegis-backend-gwu4.onrender.com/get-server?serverId=${interaction.guild.id}`
    );

    const data = await res.json();

    if (!data || !data.secureId) {
      return interaction.reply({
        content: "❌ No server linked. Use /link first.",
        flags: 64
      });
    }

    const url = `https://tu-web.netlify.app/?id=${interaction.guild.id}`;

    interaction.reply({
      content: `🌐 Open Panel:\n${url}`,
      flags: 64
    });

  } catch (err) {
    console.error(err);

    interaction.reply({
      content: "❌ Error opening panel",
      flags: 64
    });
  }
}

  // ===== WEBHOOK =====

  if (interaction.commandName === "webhook") {
    const webhook = interaction.options.getString("url");

    if (!webhook.startsWith("https://discord.com/api/webhooks/")) {
      return interaction.reply({
        content: "❌ Invalid webhook",
        flags: 64
      });
    }

    try {
      await fetch("https://aegis-backend-gwu4.onrender.com/set-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serverId: interaction.guild.id,
          webhook
        })
      });

      return interaction.reply({
        content: "✅ Webhook configured",
        flags: 64
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Error saving webhook",
        flags: 64
      });
    }
  }
});

//====== LOGIN ======

client.login(process.env.TOKEN);