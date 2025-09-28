const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Database } = require("../../db.js");
const { db_uri } = require("../../local/config.json");
const Logger = require("../../logger.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("economy")
        .setDescription("Xem số dư của bạn hoặc ai đó")
        .addSubcommand(subcommand =>
            subcommand
                .setName("balance")
                .setDescription("Xem số dư của bạn hoặc ai đó")
                .addUserOption(option => option.setName("user").setDescription("Thành viên muốn xem số dư").setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("daily")
                .setDescription("Nhận phần thưởng hàng ngày")
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName("reset")
                .setDescription("Đặt lại số dư của bạn (hoặc ai đó nếu bạn là admin)")
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName("weekly")
                .setDescription("Nhận phần thưởng hàng tuần")
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName("deposit")
                .setDescription("Gửi tiền từ ví vào ngân hàng")
                .addIntegerOption(option => option.setName("amount").setDescription("Số tiền muốn gửi").setRequired(true))
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName("withdraw")
                .setDescription("Rút tiền từ ngân hàng vào ví")
                .addIntegerOption(option => option.setName("amount").setDescription("Số tiền muốn rút").setRequired(true))
            ),
    
    async execute(interaction) {
        await interaction.deferReply();
        const logger = new Logger("BalanceCommand");

        const db = await new Database(db_uri);
        await db.connect("BestFriendsBot");
        const economy = await db.getCollection("economy");
        
        if (interaction.options.getSubcommand() === "balance") {
        const member = interaction.options.getUser("user")?.id ?? interaction.user.id;


        let userData = await economy.findOne({member});
        if (!userData) {
            await economy.updateOne(
                { member },
                { $addToSet: { wallet: 0, bank: 0 } },
                { upsert: true }
            );
            logger.info(`Created new economy record for user ${member}`);
            const embed = new EmbedBuilder()
                .setTitle(`Số dư của ${await interaction.guild.members.fetch(member).then(member => member.user.tag)}`)
                .setDescription(`**Ví:** 0 xu\n**Ngân hàng:** 0 xu`)
                .setColor("Random")
                .setTimestamp();
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('deposit')
                        .setLabel('Gửi tiền')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('withdraw')
                        .setLabel('Rút tiền')
                        .setStyle('Primary'),
                );
            await interaction.editReply({ embeds: [embed], components: [buttons] });
            return;
        } else {
            const embed = new EmbedBuilder()
            const wallet = userData.wallet || 0;
            const bank = userData.bank || 0;
            embed.setTitle(`Số dư của ${await interaction.guild.members.fetch(member).then(member => member.user.tag)}`)
                .setDescription(`**Ví:** ${wallet} xu\n**Ngân hàng:** ${bank} xu`)
                .setColor("Random")
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            return;
        }
    } else if (interaction.options.getSubcommand() === "daily") {
        const member = interaction.user.id;
        let now = Date.now();
        const random = Math.floor(Math.random() * 15) + 100;
        let userData = await economy.findOne({member});
        let wallet = userData?.wallet || 0;
        wallet += random
        let bank = userData?.bank || 0;
        if (!userData || !userData.lastDaily) {
            await economy.updateOne(
                { member },
                { $set: { wallet: wallet, bank: bank, lastDaily: now } },
                { upsert: true }
            );
            const embed = new EmbedBuilder()
                .setTitle("Phần thưởng hàng ngày")
                .setDescription(`Bạn đã nhận phần thưởng hàng ngày là **${random} xu**! Hãy quay lại sau 24 giờ để nhận thêm.`)
                .setColor("Green")
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            return;
        } else {
            if (userData.lastDaily) {
                const lastDaily = new Date(userData.lastDaily);
                const diffTime = Math.abs(now - lastDaily);
                const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                if (diffHours < 24) {
                    const nextDaily = new Date(lastDaily.getTime() + 24 * 60 * 60 * 1000);
                    const embed = new EmbedBuilder()
                        .setTitle("Phần thưởng hàng ngày")
                        .setDescription(`Bạn đã nhận phần thưởng của hôm nay rồi! Sử dụng lệnh sau <t:${Math.floor(nextDaily.getTime() / 1000)}:R> để nhận lại.`)
                        .setColor("Red")
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    return;
                } else {
                    await economy.updateOne(
                        { member },
                        { $set: { wallet: wallet, bank: bank, lastDaily: now } },
                        { upsert: true }
                    );
                    const embed = new EmbedBuilder()
                        .setTitle("Phần thưởng hàng ngày")
                        .setDescription(`Bạn đã nhận phần thưởng hàng ngày là **${random} xu**! Hãy quay lại sau 24 giờ để nhận thêm.`)
                        .setColor("Green")
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
            }
        }
    } else if (interaction.options.getSubcommand() === "reset") {
        const member = interaction.user.id;
        await economy.updateOne(
            { member },
            { $set: { wallet: 0, bank: 0, lastDaily: null } },
            { upsert: true }
        );
        const embed = new EmbedBuilder()
            .setTitle("Đã đặt lại số dư")
            .setDescription(`Số dư của bạn đã được đặt lại tất cả về 0`)
            .setColor("Orange")
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        return;
    } else if (interaction.options.getSubcommand() === "weekly") {
        const member = interaction.user.id;
        let now = Date.now();
        const random = Math.floor(Math.random() * 100) + 500;
        let userData = await economy.findOne({member});
        let wallet = userData?.wallet || 0;
        wallet += random
        let bank = userData?.bank || 0;
        if (!userData || !userData.lastWeekly) {
            await economy.updateOne(
                { member },
                { $set: { wallet: wallet, bank: bank, lastWeekly: now } },
                { upsert: true }
            );
            const embed = new EmbedBuilder()
                .setTitle("Phần thưởng hàng tuần")
                .setDescription(`Bạn đã nhận phần thưởng hàng tuần là **${random} xu**! Hãy quay lại sau 7 ngày để nhận thêm.`)
                .setColor("Green")
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            return;
        } else {
            if (userData.lastWeekly) {
                const lastWeekly = new Date(userData.lastWeekly);
                const diffTime = Math.abs(now - lastWeekly);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 7) {
                    const nextWeekly = new Date(lastWeekly.getTime() + 7 * 24 * 60 * 60 * 1000);
                    const embed = new EmbedBuilder()
                        .setTitle("Phần thưởng hàng tuần")
                        .setDescription(`Bạn đã nhận phần thưởng của tuần này rồi! Sử dụng lệnh sau <t:${Math.floor(nextWeekly.getTime() / 1000)}:R> để nhận lại.`)
                        .setColor("Red")
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    return;
                } else {
                    await economy.updateOne(
                        { member },
                        { $set: { wallet: wallet, bank: bank, lastWeekly: now } },
                        { upsert: true }
                    );
                    const embed = new EmbedBuilder()
                        .setTitle("Phần thưởng hàng tuần")
                        .setDescription(`Bạn đã nhận phần thưởng hàng tuần là **${random} xu**! Hãy quay lại sau 7 ngày để nhận thêm.`)
                        .setColor("Green")
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
            }
        }
    } else {
        await interaction.editReply("Lệnh phụ không xác định");
    }
    }
}