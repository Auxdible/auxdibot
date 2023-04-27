import {ButtonStyle, SlashCommandBuilder} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from '../../util/constants/Embeds';
import {LogType} from "../../mongo/schema/Log";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";

const massroleCommand = < AuxdibotCommand > {
    data: new SlashCommandBuilder()
        .setName('massrole')
        .setDescription('Give everybody a role, or take a role away from anyone that has it.')
        .addSubcommand(builder => builder.setName("give").setDescription("Give everybody a role.")
            .addRoleOption(argBuilder => argBuilder.setName("role").setDescription("The role to be given.").setRequired(true)))
        .addSubcommand(builder => builder.setName("take").setDescription("Take away a role from everybody.")
            .addRoleOption(argBuilder => argBuilder.setName("role").setDescription("The role to be taken away.").setRequired(true))),
    info: {
        help: {
            commandCategory: "Roles",
            name: "/massrole",
            description: "Give everybody a role, or take a role away from anyone that has it.",
            usageExample: "/massrole (give|take)"
        },
        permission: "massrole"
    },
    subcommands: [{
        name: "give",
        info: {
            help: {
                commandCategory: "Roles",
                name: "/massrole",
                description: "Give everybody a role.",
                usageExample: "/massrole give (role)"
            },
            permission: "massrole.give"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            let role = interaction.options.getRole("role");
            if (!role) return;
            let embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = "Success!";
            embed.description = `Currently giving the role...`;
            await interaction.reply({ embeds: [embed] });
            let res = await interaction.data.guild.members.fetch();
            res.forEach((member) => {
                if (!role || !interaction.data) return;
                if (!member.roles.resolve(role.id) && (interaction.data.guild.members.me && member.roles.highest.comparePositionTo(interaction.data.guild.members.me.roles.highest) < 0) &&
                    member.roles.highest.comparePositionTo(interaction.data.member.roles.highest) < 0) {
                    member.roles.add(role.id).catch(() => undefined);

                }
            });
            await interaction.data.guildData.log({
                user_id: interaction.data.member.id,
                description: `Massrole took ${role} from anyone who had it with lower role hiearchy than Auxdibot.`,
                type: LogType.MASSROLE_GIVEN,
                date_unix: Date.now()
            }, interaction.data.guild)
    }
    },
        {
            name: "take",
            info: {
                help: {
                    commandCategory: "Roles",
                    name: "/massrole",
                    description: "Take away a role from every user.",
                    usageExample: "/massrole take (role)"
                },
                permission: "massrole.take"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let role = interaction.options.getRole("role");
                if (!role) return;
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Currently removing the role...`;
                await interaction.reply({ embeds: [embed] });
                let res = await interaction.data.guild.members.fetch();
                res.forEach((member) => {
                    if (!role || !interaction.data) return;
                    if (!member.roles.resolve(role.id) && (interaction.data.guild.members.me && member.roles.highest.comparePositionTo(interaction.data.guild.members.me.roles.highest) < 0) &&
                        member.roles.highest.comparePositionTo(interaction.data.member.roles.highest) < 0) {
                        member.roles.remove(role.id).catch(() => undefined);
                    }
                });
                await interaction.data.guildData.log({
                    user_id: interaction.data.member.id,
                    description: `Massrole took ${role} from anyone who had it with lower role hiearchy than Auxdibot.`,
                    type: LogType.MASSROLE_TAKEN,
                    date_unix: Date.now()
                }, interaction.data.guild)
            }
        }],
    async execute() {
        return;
    }
}
module.exports = massroleCommand;