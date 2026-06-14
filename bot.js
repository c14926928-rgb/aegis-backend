const { Client, GatewayIntentBits } = require("discord.js");

// ===== DEBUG =====
console.log("TOKEN:", process.env.TOKEN);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== READY =====
client.once("ready", () => {
  console.log(`🤖 Bot ONLINE as ${client.user.tag}`);
});

// ===== SIMPLE COMMAND =====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 Pong!");
  }
});

// ===== REGISTER COMMAND =====
const { REST, Routes } = require("discord.js");

async function registerCommands() {
  const commands = [
    {
      name: "ping",
      description: "Test command"
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

registerCommands();

// ===== LOGIN =====
client.login(process.env.TOKEN)
  .then(() => console.log("🔐 Login success"))
  .catch(err => console.error("❌ LOGIN ERROR:", err));