const { SlashCommandBuilder, MessageFlags, Embed, EmbedBuilder } = require('discord.js')
const { Database } = require('../../db.js');
const { db_uri, app_id } = require('../../local/config.json');
const nhay = require('../../nhay.js');
const Logger = require('../../logger.js');

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
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("start")
        .setDescription("Bắt đầu chửi lộn tự động")
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("stop")
        .setDescription("Dừng chửi lộn tự động")
    ),

    async execute(interaction) {
        const db = await new Database(db_uri);
        await db.connect("BestFriendsBot");
        
        const guildId = interaction.guildId;
        const collection = await db.getCollection("curse_channels");

        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "addchannel") {
            if (interaction.member.permissions.has("ManageChannels") === false) {
                await interaction.editReply("Bạn không có quyền sử dụng lệnh này.");
                return;
            }
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
            if (interaction.member.permissions.has("ManageChannels") === false) {
                await interaction.editReply("Bạn không có quyền sử dụng lệnh này.");
                return;
            }
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
            if (interaction.member.permissions.has("ManageChannels") === false) {
                await interaction.editReply("Bạn không có quyền sử dụng lệnh này.");
                return;
            }
            let thing;
            await collection.findOne({guildId}).then(async doc => {
                if (!doc || !doc.channels || doc.channels.length === 0) {
                    interaction.editReply("Chưa có kênh chửi lộn nào được thiết lập.");
                    return;
                } else {
                    thing = doc.channels;
                }
            });
            for (const channelId of thing) {
                let randomMember = await interaction.guild.members.fetch().then(members => members.random().id);
                if (randomMember === app_id) {
                    Logger.debug("Randomly selected member is the bot itself, retrying...");
                    randomMember = await interaction.guild.members.fetch().then(members => members.random().id);
                    continue;
                }
                const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
                const nhayy = new nhay();
                curseMessage = nhayy.readRandomLine();
                if (channel && channel.isTextBased()) {
                    channel.send(`<@${randomMember}> ${curseMessage}`).catch(() => null);
                }
            }
            await interaction.editReply("Đã gửi xong.");
        } else if (subcommand === "start") {
            if (interaction.member.permissions.has("ManageChannels") === false) {
                await interaction.editReply("Bạn không có quyền sử dụng lệnh này.");
                return;
            }
            const collectionz = await db.getCollection("curse_config");
            await collectionz.updateOne(
                { guildId },
                { $set: { enabled: true } },
                { upsert: true }
            );
            await interaction.editReply("Đã bật tự động chửi lộn");
        } else if (subcommand === "stop") {
            if (interaction.member.permissions.has("ManageChannels") === false) {
                await interaction.editReply("Bạn không có quyền sử dụng lệnh này.");
                return;
            }
            const collectionz = await db.getCollection("curse_config");
            await collectionz.updateOne(
                { guildId },
                { $set: { enabled: false } },
                { upsert: true }
            );
            await interaction.editReply("Đã tắt tự động chửi lộn");
        }
        else {
            await interaction.editReply("Không rõ lệnh.");
        }
        await db.close();
    }
}