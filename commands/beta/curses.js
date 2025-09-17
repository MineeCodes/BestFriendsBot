const { SlashCommandBuilder, MessageFlags, Embed, EmbedBuilder } = require('discord.js')
const { Database } = require('../../db.js');
const { db_uri } = require('../../local/config.json');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("curses")
    .setDescription("Các câu lệnh liên quan đến chửi lộn")
    .addSubcommand(subcommand =>
        subcommand
        .setName("addchannel")
        .setDescription("Thêm kênh vào danh sách kênh chửi lộn")
        .addChannelOption(option => option.setName("channel").setDescription("Kênh muốn thêm").setRequired(false))
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("removechannel")
        .setDescription("Xóa kênh khỏi danh sách kênh chửi lộn")
        .addChannelOption(option => option.setName("channel").setDescription("Kênh muốn xóa").setRequired(false))
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
        const db = await new Database(db_uri);
        await db.connect("BestFriendsBot");
        
        const guildId = interaction.guildId;
        const collection = await db.getCollection("curse_channels");

        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "addchannel") {
            const channel = interaction.options.getChannel("channel") ? interaction.options.getChannel("channel") : interaction.channel;

            const exists = await collection.findOne({ guildId, channels: channel.id });

            if (exists) {
                await interaction.editReply(`Kênh ${channel} đã có trong danh sách kênh chửi lộn`);
                return;
            }

            await collection.updateOne(
                { guildId },
                { $addToSet: { channels: channel.id } },
                { upsert: true }
            );

            await interaction.editReply(`Đã thêm kênh ${channel} vào danh sách kênh chửi lộn`);
        } else if (subcommand === "removechannel") {
            const channel = interaction.options.getChannel("channel") ? interaction.options.getChannel("channel") : interaction.channel;

            const exists = await collection.findOne({ guildId, channels: channel.id });

            if (!exists) {
                await interaction.editReply(`Kênh ${channel} không có trong danh sách kênh chửi lộn`);
                return;
            }
            
            await collection.updateOne(
                { guildId },
                { $pull: { channels: channel.id } },
                { upsert: true }
            );

            await interaction.editReply(`Đã xóa kênh ${channel} khỏi danh sách kênh chửi lộn`);
        } else if (subcommand === "listchannel") {
            let thing;
            await collection.findOne({ guildId }).then(async doc => {
                if (!doc || !doc.channels || doc.channels.length === 0) {
                    interaction.editReply("Chưa có kênh chửi lộn nào được thiết lập.");
                    return;
                } else {
                    thing = doc.channels;
                }
            });
            embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Danh sách kênh chửi lộn")
            .setDescription(thing.map(id => `<#${id}> (ID: ${id})`).join("\n"))
            .setTimestamp()
            .setFooter({ text: `Được chạy bởi ${interaction.user.username}`});
            await interaction.editReply({ embeds: [embed] });
        } else if (subcommand === "now") {
            await interaction.editReply("[WIP]");
        } else {
            await interaction.editReply("Không rõ lệnh.");
        }
        await db.close();
    }
}