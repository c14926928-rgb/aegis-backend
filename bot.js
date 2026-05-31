const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

//====== SERVERS ======

client.on("guildCreate", async (guild) => {
    console.log("Nuevo servidor:", guild.name);

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

        console.log("Server registrado en backend");

    } catch (err) {
        console.log("Error registrando server");
        console.error(err);
    }
});

//====== COMMANDS ======

const pendingLinks = new Map();

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  // LINK
  if (message.content === "!link") {

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    pendingLinks.set(code, {
      guildId: message.guild.id
    });

    message.reply(`🔗 Código de vinculación:\n${code}\nPon esto en el mod.`);
  }

  // PANEL
  if (message.content === "!panel") {

    const link = `https://fascinating-pastelito-b15e07.netlify.app/?server=${message.guild.id}`;

    message.reply(`🖥 Panel:\n${link}`);
  }
});

//====== WEBHOOKS ======

if (message.content.startsWith("!webhook ")) {

  const webhook = message.content.split(" ")[1];

  // VALIDAR FORMATO
 
  if (!webhook || !webhook.startsWith("https://discord.com/api/webhooks/")) {
    return message.reply("❌ Webhook inválido");
  }

  try {
    await fetch("https://aegis-backend-gwu4.onrender.com/set-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId: message.guild.id,
        webhook
      })
    });

    message.reply("✅ Webhook configurado correctamente");

  } catch (err) {
    console.error(err);
    message.reply("❌ Error al guardar webhook");
  }
}

//====== GUIDE ======

if (message.content === "!help") {

  try {
    await message.author.send(
`🛡️ **AegisAC Help Menu**

Welcome to AegisAC 🚨  
Here’s everything you need to get started.

━━━━━━━━━━━━━━━━━━━━━━

📌 **Core Commands**

!setup → Full setup guide  
!webhook → Configure alerts  
!link → Link your Minecraft server  
!panel → Open your dashboard  

━━━━━━━━━━━━━━━━━━━━━━

⚙️ **Quick Setup (Recommended)**

1. Run: !webhook  
2. Set your Discord webhook  
3. Run: !link  
4. Use /link CODE in Minecraft  
5. Run: !panel  

✅ Done — your system is fully connected

━━━━━━━━━━━━━━━━━━━━━━

🧠 **How the System Works**

• The mod collects player data  
• Data is sent to the backend  
• The backend processes detections  
• Alerts are sent to your Discord  

Everything is automatic and server-specific.

━━━━━━━━━━━━━━━━━━━━━━

📡 **Features**

✔ Live player tracking  
✔ Cheat detection alerts  
✔ Real-time monitoring  
✔ Multi-server support  
✔ Discord integration  

━━━━━━━━━━━━━━━━━━━━━━

🔒 **Security**

• Webhooks are stored securely  
• No sensitive data in the mod  
• Each server is isolated  

━━━━━━━━━━━━━━━━━━━━━━

❓ **Need Help?**

Use !setup for a full step-by-step guide.

━━━━━━━━━━━━━━━━━━━━━━

🚀 AegisAC is now ready to protect your server.
`
    );

    message.reply("📩 Check your DMs for the help menu.");

  } catch (err) {
    message.reply("❌ I can't send you a DM. Please enable direct messages.");
  }
}

//====== TOKEN ======

client.login(process.env.TOKEN);