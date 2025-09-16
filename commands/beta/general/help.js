const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const config = require('../../../local/config.json');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lấy danh sách các lệnh của bot"),

    async execute(interaction) {
        const client = interaction.client;

        await interaction.deferReply();
        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Danh sách lệnh của bot')
        .setDescription('Các lệnh hiện có của bot')
        .setTimestamp()
        .setFooter({ text: `Được chạy bởi ${interaction.user.username}`});
        if (interaction.guildId == config.dev_server) {
            for (const command of client.commands.beta.values()) {
                embed.addFields({
                    name: `/${command.data.name}`,
                    value: command.data.description
                });
            }
            for (const command of client.commands.release.values()) {
                embed.addFields({
                    name: `/${command.data.name}`,
                    value: command.data.description
                });
            }
        }
        else {
        }
        for (const command of client.commands.release.values()) {
            embed.addFields({
                name: `/${command.data.name}`,
                value: command.data.description
            });
        }
        await interaction.editReply({ embeds: [embed] });
    }
}