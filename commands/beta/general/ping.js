const { SlashCommandBuilder, MessageFlags } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lấy danh sách các lệnh của bot"),

    async execute(interaction) {
        await interaction.deferReply();
        await interaction.editReply("Danh sách lệnh: \n /ping - Kiểm tra độ trễ của bot\n /help - Lấy danh sách các lệnh của bot");
    },
}