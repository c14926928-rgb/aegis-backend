const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const fetch = require("node-fetch");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const pendingLinks = new Map();

//====== READY + REGISTER COMMANDS ======

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
      description: "Generate link code"
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
  console.log("🧠 New server:", guild.name);

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

  // ===== HELP =====
  if (interaction.commandName === "help") {
    try {
      await interaction.user.send(`🛡️ AegisAC Help

Commands:
/webhook → Set alerts
/link → Link server
/panel → Open dashboard

Use /webhook to start.`);

      return interaction.reply({
        content: "📩 Check your DMs",
        ephemeral: true
      });

    } catch {
      return interaction.reply({
        content: "❌ Enable DMs first",
        ephemeral: true
      });
    }
  }

  // ===== PANEL =====
  if (interaction.commandName === "panel") {
    const link = `https://fascinating-pastelito-b15e07.netlify.app/?server=${interaction.guild.id}`;

    return interaction.reply({
      content: `🖥 ${link}`,
      ephemeral: true
    });
  }

  // ===== LINK =====
  if (interaction.commandName === "link") {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    pendingLinks.set(code, {
      guildId: interaction.guild.id
    });

    return interaction.reply({
      content: `🔗 Code: ${code}\nUse it in Minecraft with /link`,
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

//====== (OPCIONAL) MESSAGE COMMANDS BACKUP ======

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // fallback solo si quieres mantener compatibilidad
  if (message.content === "!panel") {
    const link = `https://fascinating-pastelito-b15e07.netlify.app/?server=${message.guild.id}`;
    message.reply(`🖥 ${link}`);
  }
});

//====== LOGIN ======

client.login(process.env.TOKEN);