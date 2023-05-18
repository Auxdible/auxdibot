import AuxdibotButton from '@util/types/AuxdibotButton';
import { GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@util/functions/canExecute';
import Embeds from '@util/constants/Embeds';
import { IPunishment } from '@schemas/PunishmentSchema';
import Server from '@models/server/Server';
import { LogType } from '@util/types/enums/Log';

module.exports = <AuxdibotButton>{
   name: 'ban',
   permission: 'moderation.ban',
   async execute(interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const member = interaction.guild.members.resolve(user_id);
      if (!member) {
         const embed = Embeds.ERROR_EMBED.toJSON();
         embed.description = 'This user is not in the server!';
         return await interaction.reply({ embeds: [embed] });
      }

      if (!(await canExecute(interaction.guild, interaction.member as GuildMember, member))) {
         const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      const server = await Server.findOrCreateServer(interaction.guild.id);
      const data = await server.fetchData(),
         counter = await server.fetchCounter();
      if (data.getPunishment(user_id, 'ban')) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = 'This user is already banned!';
         return await interaction.reply({ embeds: [errorEmbed] });
      }

      interaction.guild.members
         .ban(member, {
            reason: 'No reason given.',
         })
         .then(async () => {
            if (!interaction.guild) return;
            const banData = <IPunishment>{
               type: 'ban',
               reason: 'No reason given.',
               date_unix: Date.now(),
               dmed: false,
               expired: false,
               expires_date_unix: undefined,
               user_id: user_id,
               moderator_id: interaction.user.id,
               punishment_id: counter.incrementPunishmentID(),
            };
            server.punish(banData).then(async (embed) => {
               if (!embed || !interaction.guild) return;
               await server.log(
                  interaction.guild,
                  {
                     user_id: user_id,
                     description: 'A user was banned.',
                     date_unix: Date.now(),
                     type: LogType.BAN,
                     punishment: banData,
                  },
                  true,
               );
               return await interaction.reply({ embeds: [embed] });
            });
         })
         .catch(async () => {
            const errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "Couldn't ban that user. Check and see if they have a higher role than Auxdibot.";
            return await interaction.reply({ embeds: [errorEmbed] });
         });
      return;
   },
};
