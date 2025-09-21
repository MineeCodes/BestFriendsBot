const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
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
            await interaction.editReply({ embeds: [embed] });
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
    } else {
        await interaction.editReply("Lệnh phụ không xác định");
    }
    }
}