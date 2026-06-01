const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fetch = require("node-fetch");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const pendingLinks = new Map();

//====== READY ======

client.once("ready", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const commands = [
    { name: "help", description: "Show help menu" },
    { name: "panel", description: "Open dashboard" },
    { name: "link", description: "Generate link code" },
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

//====== SLASH COMMANDS ======

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ===== HELP (PRO VERSION) =====
  if (interaction.commandName === "help") {

    const embed = new EmbedBuilder()
      .setTitle("🛡️ Conclave AegisAC • Anti-Cheat System")
      .setColor(0x6c5ce7)
      .setDescription("Conclave AegisAC Real-time anti-cheat protecting your Minecraft server 24/7.")

      .addFields(
        {
          name: "🧠 What it does",
          value: "Detects cheats, tracks players and sends alerts in real-time."
        },
        {
          name: "⚙️ System",
          value: "Mod → Backend → Discord → Web Panel"
        },
        {
          name: "🚀 Setup",
          value:
`1. /webhook  
2. /link  
3. /link CODE (in Minecraft)  
4. /panel`
        },
        {
          name: "📌 Commands",
          value:
`/webhook → Alerts  
/link → Link server  
/panel → Dashboard`
        }
      )

      .setFooter({ text: "AegisAC System" });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  // ===== PANEL (BOTÓN PRO) =====
  if (interaction.commandName === "panel") {

    const link = `https://fascinating-pastelito-b15e07.netlify.app/?server=${interaction.guild.id}`;

    const embed = new EmbedBuilder()
      .setTitle("🖥 Aegis Dashboard")
      .setDescription("Access your real-time monitoring panel")
      .setColor(0x6c5ce7);

    const button = new ButtonBuilder()
      .setLabel("Open Dashboard")
      .setStyle(ButtonStyle.Link)
      .setURL(link);

    const row = new ActionRowBuilder().addComponents(button);

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }

  // ===== LINK =====
  if (interaction.commandName === "link") {

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await fetch("https://aegis-backend-gwu4.onrender.com/generate-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      uuid: "pending", // luego lo mejoras
      guildId: interaction.guild.id
    })
  });

  return interaction.reply({
    content: `🔗 Code: ${code}`,
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
        ephemeral: true
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Error saving webhook",
        ephemeral: true
      });
    }
  }
});

//====== LOGIN ======

client.login(process.env.TOKEN);