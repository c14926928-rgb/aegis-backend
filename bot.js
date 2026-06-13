const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require("discord.js");

// ===== ENV CHECK =====
if (!process.env.TOKEN) {
  console.error("❌ TOKEN missing in ENV");
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error("❌ CLIENT_ID missing in ENV");
  process.exit(1);
}

// 🔥 FETCH FIX
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

    // ⚡ INSTANT COMMANDS (DEV MODE)
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID // 👈 IMPORTANTE
      ),
      { body: commands }
    );

    console.log("✅ Commands registered instantly (guild)");

  } catch (err) {
    console.error("❌ Command register error:", err);
  }
});

// ================= COMMANDS =================

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {

    // ===== HELP =====
    if (interaction.commandName === "help") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🛡️ Conclave AegisAC")
            .setColor(0x6c5ce7)
            .setDescription("Anti-cheat system")
            .addFields({ name: "Commands", value: "/link\n/panel\n/webhook" })
        ],
        ephemeral: true
      });
    }

    // ===== LINK =====
    if (interaction.commandName === "link") {

      const ip = interaction.options.getString("ip");
      const serverId = interaction.guild.id;

      await fetch("https://aegis-backend-gwu4.onrender.com/link-server", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ serverId, ip })
      });

      return interaction.reply({
        content: `🛡️ Server Linked\n\n📡 IP: ${ip}\n🆔 ID: ${serverId}`,
        ephemeral: true
      });
    }

    // ===== PANEL =====
    if (interaction.commandName === "panel") {

      const serverId = interaction.guild.id;
      const url = `https://conclaveaegisac.netlify.app/?id=${serverId}`;

      return interaction.reply({
        content: `🌐 Panel:\n${url}`,
        ephemeral: true
      });
    }

    // ===== WEBHOOK =====
    if (interaction.commandName === "webhook") {

      const webhook = interaction.options.getString("url");

      if (!webhook.startsWith("https://discord.com/api/webhooks/")) {
        return interaction.reply({
          content: "❌ Invalid webhook",
          ephemeral: true
        });
      }

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
        ephemeral: true
      });
    }

  } catch (err) {
    console.error("❌ Command error:", err);

    if (!interaction.replied) {
      interaction.reply({
        content: "❌ Error executing command",
        ephemeral: true
      });
    }
  }
});

// ================= LOGIN =================

client.login(process.env.TOKEN)
  .then(() => console.log("🔐 Login success"))
  .catch(err => {
    console.error("❌ LOGIN ERROR:", err);
  });