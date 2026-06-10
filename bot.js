const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require("discord.js");

// 🔥 FIX FETCH
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ================= READY =================

client.once("ready", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const commands = [
    { name: "help", description: "Show help menu" },
    { name: "panel", description: "Open dashboard" },
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

// ================= COMMANDS =================

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ===== HELP =====
  if (interaction.commandName === "help") {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🛡️ Conclave AegisAC")
          .setColor(0x6c5ce7)
          .setDescription("Anti-cheat system")
          .addFields(
            { name: "Commands", value: "/link\n/panel\n/webhook" }
          )
      ],
      flags: 64
    });
  }

  // ===== LINK =====
  if (interaction.commandName === "link") {

    const ip = interaction.options.getString("ip");
    const serverId = interaction.guild.id;

    try {
      await fetch("https://aegis-backend-gwu4.onrender.com/link-server", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ serverId, ip })
      });

      return interaction.reply({
        content: `🛡️ Server Linked

📡 IP: ${ip}
🆔 Server ID: ${serverId}

👉 Put this ID in your mod config`,
        flags: 64
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Error linking server",
        flags: 64
      });
    }
  }

  // ===== PANEL =====
  if (interaction.commandName === "panel") {

    const serverId = interaction.guild.id;

    const url = `https://conclaveaegisac.netlify.app/?id=${serverId}`;

    return interaction.reply({
      content: `🌐 Open Panel:\n${url}`,
      flags: 64
    });
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

// ================= LOGIN =================

client.login(process.env.TOKEN);