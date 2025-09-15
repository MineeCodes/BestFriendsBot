const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check độ nhanh của kết nối giữa bot và server"),

    async execute(interaction) {
        await interaction.reply(`Pong!`);
    },
}