import {
    APIEmbed, Channel, EmbedField,
    SlashCommandBuilder, TextChannel
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from "../../util/constants/Embeds";
import parsePlaceholders from "../../util/functions/parsePlaceholder";
import EmbedParameters, {toAPIEmbed} from "../../util/types/EmbedParameters";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
import createEmbedParameters from "../../util/functions/createEmbedParameters";
import argumentsToEmbedParameters from "../../util/functions/argumentsToEmbedParameters";

const leaveCommand = <AuxdibotCommand>{
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Change settings for leave messages on the server.')
        .addSubcommand(builder => createEmbedParameters(builder.setName('message').setDescription('Display an embed (With placeholders)!')))
        .addSubcommand(builder => builder.setName('embed_json').setDescription('Display some JSON as an embed (With placeholders)!')
            .addStringOption(option => option.setName("json")
            .setDescription("The JSON data to use for creating the Discord Embed.")
            .setRequired(true)))
        .addSubcommand(builder => builder.setName('preview').setDescription('Preview the leave embed.')),
    info: {
        help: {
            commandCategory: "Settings",
            name: "/leave",
            description: "Change settings for leave messages on the server. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
            usageExample: "/leave (message|embed_json|preview)"
        },
        permission: "settings.leave"
    },
    subcommands: [{
        name: "message",
        info: {
            help: {
                commandCategory: "Settings",
                name: "/leave message",
                description: "Set the leave message. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                usageExample: "/leave message (color) (title) [author_text] [description] [fields (split title and description with `\"|d|\"``, and seperate fields with `\"|s|\"`)] [footer] [image url] [thumbnail url]"
            },
            permission: "settings.leave.message"
        },
        async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            let settings = await interaction.data.guildData.fetchSettings();
            let content = interaction.options.getString("content");
            let parameters = argumentsToEmbedParameters(interaction);
            try {
                settings.setLeaveEmbed(toAPIEmbed(parameters));
                if (content) {
                    settings.setLeaveText(content);
                }
                await settings.save();
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Set the leave embed.`;
                await interaction.reply({ embeds: [embed] });
            } catch (x) {
                let embed = Embeds.ERROR_EMBED.toJSON();
                embed.description = "Couldn't make that embed!";
                return await interaction.reply({ embeds: [embed] });
            }
            if (interaction.channel && (interaction.channel as Channel).isTextBased()) {
                try {
                    let channel = (interaction.channel) as TextChannel;
                    await channel.send({ content: "Here's a preview of the new leave embed!", embeds: [JSON.parse(await parsePlaceholders(JSON.stringify(settings.leave_embed), interaction.data.guild, interaction.data.member)) as APIEmbed] });
                } catch (x) { }
            }
            return; 
        }
    },
        {
            name: "embed_json",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/leave embed_json",
                    description: "Add an embed to the join message using custom JSON. (Placeholders are supported. Do /placeholders for a list of placeholders.)",
                    usageExample: "/leave embed_json (json)"
                },
                permission: "settings.leave.embed_json"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let json = interaction.options.getString('json') || undefined;
                let settings = await interaction.data.guildData.fetchSettings();
                if (!json) return;
                let jsonEmbed = JSON.parse(json) as APIEmbed;
                if (!jsonEmbed['type'] || jsonEmbed['type'] != "rich") {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "This isn't valid Embed JSON!";
                    return await interaction.reply({ embeds: [error] });
                }
                settings.setLeaveEmbed(jsonEmbed);
                await settings.save();
                let embed = Embeds.SUCCESS_EMBED.toJSON();
                embed.title = "Success!";
                embed.description = `Set the leave embed.`;

                if (interaction.channel && (interaction.channel as Channel).isTextBased()) {
                    try {
                        let channel = (interaction.channel) as TextChannel;
                        await channel.send({ content: "Here's a preview of the new leave embed!", embeds: [JSON.parse(await parsePlaceholders(JSON.stringify(settings.leave_embed), interaction.data.guild, interaction.data.member)) as APIEmbed] });
                    } catch (x) { }
                }
                return await interaction.reply({ embeds: [embed] });
            }
        },
        {
            name: "preview",
            info: {
                help: {
                    commandCategory: "Settings",
                    name: "/leave preview",
                    description: "Preview the leave message.",
                    usageExample: "/leave preview"
                },
                permission: "settings.leave.preview"
            },
            async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
                if (!interaction.data) return;
                let settings = await interaction.data.guildData.fetchSettings();
                try {
                    return await interaction.reply({ content: `**EMBED PREVIEW**\r\n${settings.leave_text || ""}`, embeds: settings.leave_embed ? [JSON.parse(await parsePlaceholders(JSON.stringify(settings.leave_embed), interaction.data.guild, interaction.data.member)) as APIEmbed] : [] });
                } catch (x) {
                    let error = Embeds.ERROR_EMBED.toJSON();
                    error.description = "This isn't valid! Try changing the Leave Embed or Leave Text.";
                    return await interaction.reply({ embeds: [error] });
                }
            }
        }],
    async execute() {
        return;
    },
}
module.exports = leaveCommand;