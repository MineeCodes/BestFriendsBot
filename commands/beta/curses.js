const { SlashCommandBuilder, MessageFlags } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("curses")
    .setDescription("Các câu lệnh liên quan đến chửi lộn")
    .addSubcommand(subcommand =>
        subcommand
        .setName("addchannel")
        .setDescription("Thêm kênh vào danh sách kênh chửi lộn")
        .addChannelOption(option => option.setName("channel").setDescription("Kênh muốn thêm").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("removechannel")
        .setDescription("Xóa kênh khỏi danh sách kênh chửi lộn")
        .addChannelOption(option => option.setName("channel").setDescription("Kênh muốn xóa").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("listchannel")
        .setDescription("Xem danh sách kênh chửi lộn")
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("now")
        .setDescription("Chửi ngay và luôn")
    ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "addchannel") {
            const channel = interaction.options.getChannel("channel");
            await interaction.reply(`Đã thêm kênh ${channel} vào danh sách kênh chửi lộn`);
        } else if (subcommand === "removechannel") {
            const channel = interaction.options.getChannel("channel");
            await interaction.reply(`Đã xóa kênh ${channel} khỏi danh sách kênh chửi lộn`);
        } else if (subcommand === "listchannel") {
            await interaction.reply("[WIP]");
        } else if (subcommand === "now") {
            await interaction.reply("[WIP]");
        }
    }
}