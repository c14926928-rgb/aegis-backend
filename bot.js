require("dotenv").config();

const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once("clientReady", async () => {
    console.log(`🤖 ONLINE: ${client.user.tag}`);
    await registerCommands();
});

// ===== COMMAND HANDLER =====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {

    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong!");
    }

  } catch (err) {
    console.error("❌ COMMAND ERROR:", err);
    return interaction.reply({ content: "Error", ephemeral: true });
  }
});

// ===== REGISTER COMMANDS =====
async function registerCommands() {

  const commands = [
    {
      name: "ping",
      description: "Test bot"
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

  console.log("✅ Commands ready");
}

// ===== LOGIN =====
client.login(process.env.TOKEN)
    .then(() => console.log("🔐 LOGIN OK"))
    .catch(err => console.error("❌ LOGIN ERROR:", err));

module.exports = {
    client
};