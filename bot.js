const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

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

  // ===== PANEL (FIXED) =====
  if (interaction.commandName === "panel") {

    try {
      const res = await fetch(`https://aegis-backend-gwu4.onrender.com/get-proxy?serverId=${interaction.guild.id}`);
      const data = await res.json();

      const embed = new EmbedBuilder()
        .setTitle("🛡️ Protected Server")
        .setDescription(`IP: ${data.proxy || "Not assigned yet"}`)
        .setColor(0x6c5ce7);

      const button = new ButtonBuilder()
        .setLabel("Open Dashboard")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://fascinating-pastelito-b15e07.netlify.app/?server=${interaction.guild.id}`);

      const row = new ActionRowBuilder().addComponents(button);

      return interaction.reply({
        embeds: [embed],
        components: [row],
        flags: 64
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Failed to fetch proxy",
        flags: 64
      });
    }
  }

  // ===== LINK =====
  if (interaction.commandName === "link") {

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await interaction.reply({
      content: `🔗 Code: ${code}`,
      flags: 64
    });

    fetch("https://aegis-backend-gwu4.onrender.com/generate-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        uuid: "pending",
        guildId: interaction.guild.id,
        code
      })
    }).catch(console.error);
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