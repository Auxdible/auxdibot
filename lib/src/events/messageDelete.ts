import {Message} from "discord.js";
import Server from "../mongo/model/Server";
import {LogType} from "../util/types/Log";

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message: Message) {
        let sender = message.member;
        if (!sender || !message.guild) return;
        let server = await Server.findOrCreateServer(message.guild.id);
        let rr = server.reaction_roles.find((rr) => rr.message_id == message.id);
        if (rr) {
            server.removeReactionRole(server.reaction_roles.indexOf(rr));
            await server.log({
                user_id: sender.id,
                description: `Deleted a reaction role${message ? ` in ${message.channel || "a channel"}` : ""}.`,
                type: LogType.REACTION_ROLE_REMOVED,
                date_unix: Date.now()
            }, message.guild)
        }
        await server.log({
            type: LogType.MESSAGE_DELETED,
            date_unix: Date.now(),
            description: `A message by ${sender.user.tag} was deleted.`,
            message_edit: { former: message.cleanContent, now: "[deleted]" },
            user_id: sender.id
        }, message.guild)
    }
}