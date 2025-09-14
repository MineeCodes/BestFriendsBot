const { Client, GatewayIntentBits } = require('discord.js');
const { token, prefix } = require('./local/config.json')

const client = new Client({ intents: [
    GatewayIntentBits.Guild,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);