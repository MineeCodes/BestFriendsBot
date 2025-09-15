const { SlashCommandBuilder, MessageFlags } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("curses")
    .setDescription("Các câu lệnh liên quan đến chửi lộn")
    .addSubcommand(subcommand =>
        subcommand
        .setName("addChannel")
        .setDescription("Thêm kênh vào danh sách kênh chửi lộn")
        .addChannelOption(option => option.setName("channel").setDescription("Kênh muốn thêm").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("removeChannel")
        .setDescription("Xóa kênh khỏi danh sách kênh chửi lộn")
        .addChannelOption(option => option.setName("channel").setDescription("Kênh muốn xóa").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("listChannel")
        .setDescription("Xem danh sách kênh chửi lộn")
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("now")
        .setDescription("Chửi ngay và luôn")
    ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "addChannel") {
            const channel = interaction.options.getChannel("channel");
            await interaction.reply(`Đã thêm kênh ${channel} vào danh sách kênh chửi lộn`);
        } else if (subcommand === "removeChannel") {
            const channel = interaction.options.getChannel("channel");
            await interaction.reply(`Đã xóa kênh ${channel} khỏi danh sách kênh chửi lộn`);
        } else if (subcommand === "listChannel") {
            await interaction.reply("[WIP]");
        } else if (subcommand === "now") {
            await interaction.reply("[WIP]");
        }
    }
}