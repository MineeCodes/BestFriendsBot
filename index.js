const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, REST, Routes } = require('discord.js');
const config = require('./local/config.json');
const { stringify } = require('node:querystring');

const client = new Client({ intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
] });

client.commands = new Collection();
client.commands.release = new Collection();
client.commands.beta = new Collection();

const commandsRelease = [];
const commandsBeta = [];
const foldersPathRelease = path.join(__dirname, 'commands', 'release');
const commandFoldersRelease = fs.readdirSync(foldersPathRelease);
const foldersPathBeta = path.join(__dirname, 'commands', 'beta');
const commandFoldersBeta = fs.readdirSync(foldersPathBeta)

for (const folder of commandFoldersRelease) {
	const commandsPath = path.join(foldersPathRelease, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commandsRelease.push(command.data.toJSON());
			client.commands.release.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

for (const folder of commandFoldersBeta) {
    const commandsPath = path.join(foldersPathBeta, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commandsBeta.push(command.data.toJSON());
			client.commands.beta.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command =
        client.commands.release.get(interaction.commandName) ||
        client.commands.beta.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        const replyOptions = {
            content: 'There was an error while executing this command!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
});


client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

console.log('App ID:', config.app_id);      // should print the correct string
console.log('Guild ID:', config.dev_server); // should print the correct string


const rest = new REST().setToken(config.token);
const appId = config.app_id.toString();

(async () => {
	try {
		console.log(`Started refreshing ${commandsRelease.length} application commands.`);

		const data = await rest.put(
			Routes.applicationCommands(appId),
			{ body: commandsRelease },
		);

		console.log(`Successfully reloaded ${data.length} application commands.`);
	} catch (error) {
		console.error(error);
	}
})();

(async () => {
    try {
        console.log(`Started refreshing ${commandsBeta.length} beta application commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(appId, config.dev_server),
            { body: commandsBeta },
        );

        console.log(`Successfully reloaded ${data.length} beta application commands.`);
    } catch (error) {
        console.error(error);
    }
})();

client.login(config.token);