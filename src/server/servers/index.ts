import { Auxdibot } from '@/interfaces/Auxdibot';
import express from 'express';
import checkAuthenticated from '../checkAuthenticated';
import log from './routes/log';
import reset from './routes/reset';
import channels from './routes/channels';
import logChannel from './routes/logChannel';
import nick from './routes/nick';
import modules from './routes/modules';
import punishments from './routes/punishments';
import roles from './routes/roles';
import schedules from './routes/schedules';
import embeds from './routes/embeds';
import starboard from './routes/starboard';
import suggestions from './routes/suggestions';
import levels from './routes/levels';
import reactionRoles from './routes/reaction_roles';
import massrole from './routes/massrole';
import greetings from './routes/greetings';
import moderation from './routes/moderation';
import updateCard from './routes/updateCard';
import joinRoles from './routes/join_roles';
import stickyRoles from './routes/sticky_roles';
import emojis from './routes/emojis';
import notifications from './routes/notifications';
import { Guild } from 'discord.js';
import commands from './routes/commands';

const router = express.Router();

export const serversRoute = (auxdibot: Auxdibot) => {
   /*
   /:serverID
   Obtain data about your server
   */
   router.get(
      '/:serverID',
      (req, res, next) => checkAuthenticated(req, res, next),
      async (req, res) => {
         if (!req.user?.guilds) return res.status(400).json(null);
         const serverID = req.params.serverID,
            check = req.query['check'];
         const guild: Guild = await auxdibot.guilds.fetch(serverID).catch(() => undefined);
         if (!guild) return res.status(404).json(null);
         const data = req.user.guilds.find((i) => i.id == serverID);
         if (guild.ownerId != req.user.id && !data && !(data?.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const guildData = guild.toJSON();
         if (typeof guildData != 'object') return res.status(404).json(null);
         return auxdibot.database.servers
            .findFirst({ where: { serverID }, ...(check ? { select: { serverID: true } } : {}) })
            .then((i) => (i ? res.json({ ...guildData, data: i }) : res.status(404).json(null)))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );

   log(auxdibot, router);
   reset(auxdibot, router);
   modules(auxdibot, router);
   channels(auxdibot, router);
   logChannel(auxdibot, router);
   nick(auxdibot, router);
   punishments(auxdibot, router);
   roles(auxdibot, router);
   schedules(auxdibot, router);
   embeds(auxdibot, router);
   starboard(auxdibot, router);
   suggestions(auxdibot, router);
   levels(auxdibot, router);
   reactionRoles(auxdibot, router);
   massrole(auxdibot, router);
   greetings(auxdibot, router);
   moderation(auxdibot, router);
   updateCard(auxdibot, router);
   joinRoles(auxdibot, router);
   stickyRoles(auxdibot, router);
   emojis(auxdibot, router);
   notifications(auxdibot, router);
   commands(auxdibot, router);

   return router;
};
