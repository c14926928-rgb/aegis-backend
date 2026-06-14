const { Client, GatewayIntentBits } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// ===== DEBUG =====
console.log("TOKEN:", process.env.TOKEN);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== READY =====
client.once("ready", () => {
  console.log(`🤖 Bot ONLINE as ${client.user.tag}`);

   await registerCommands();
});

// ===== SIMPLE COMMAND =====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ===== PING =====
  if (interaction.commandName === "ping") {
    return interaction.reply("🏓 Pong!");
  }

  // ===== BAN =====
  if (interaction.commandName === "ban") {
    const player = interaction.options.getString("player");

    await fetch("https://aegis-backend-gwu4.onrender.com/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId: interaction.guild.id,
        type: "BAN",
        player
      })
    });

    return interaction.reply({
      content: `🔨 Ban sent: ${player}`,
      ephemeral: true
    });
  }

  // ===== KICK =====
  if (interaction.commandName === "kick") {
    const player = interaction.options.getString("player");

    await fetch("https://aegis-backend-gwu4.onrender.com/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId: interaction.guild.id,
        type: "KICK",
        player
      })
    });

    return interaction.reply({
      content: `👢 Kick sent: ${player}`,
      ephemeral: true
    });
  }

  // ===== ALERT =====
  if (interaction.commandName === "alert") {
    const message = interaction.options.getString("message");

    await fetch("https://aegis-backend-gwu4.onrender.com/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId: interaction.guild.id,
        message: `[ALERT] ${message}`
      })
    });

    return interaction.reply({
      content: `🚨 Alert sent`,
      ephemeral: true
    });
  }

});

// ===== REGISTER COMMAND =====
const { REST, Routes } = require("discord.js");

async function registerCommands() {
const commands = [
  { name: "ping", description: "Test bot" },
  { name: "panel", description: "Open dashboard" },

  {
    name: "link",
    description: "Link server",
    options: [
      {
        name: "ip",
        type: 3,
        required: true,
        description: "Server IP"
      }
    ]
  },

  {
    name: "ban",
    description: "Ban player",
    options: [
      {
        name: "player",
        type: 3,
        required: true,
        description: "Player name"
      }
    ]
  },

  {
    name: "kick",
    description: "Kick player",
    options: [
      {
        name: "player",
        type: 3,
        required: true,
        description: "Player name"
      }
    ]
  },

  {
    name: "alert",
    description: "Send alert",
    options: [
      {
        name: "message",
        type: 3,
        required: true,
        description: "Alert message"
      }
    ]
  }
];

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("✅ Commands registered");
}

process.on("unhandledRejection", err => console.error(err));
process.on("uncaughtException", err => console.error(err));

// ===== LOGIN =====
client.login(process.env.TOKEN)
  .then(() => console.log("🔐 Conclave AegisAC-Bot Running "))
  .catch(err => console.error("❌ LOGIN ERROR:", err));