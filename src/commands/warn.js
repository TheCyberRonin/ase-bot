'use strict';
const Command = require('../structures/Command');

//command to warn users
module.exports = function command(requires)
{
  return new Command({
    name: 'Warn',
    inline: true,
    alias: ['w'],
    blurb: 'Warns people.',
    permission: 'low',
    action: function(details)
    {
      const bot = requires.bot;
      const info = requires.info;
      const wholeTest = /<\@!*([a-zA-Z0-9]+)>\s([一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤]+|.+)+/g;
      const idAndSpace = /<\@!*([a-zA-Z0-9]+)>\s/g;
      //processes input
      if(details.input === "") {return;}
      else
      {
        if(!wholeTest.test(details.input)) {
          return;
        } else {
          const userTest = info.utility.stripUID(details.args[1]);
          if(userTest) {
            const reason = details.input.replace(idAndSpace, '');
            info.db.addInfraction(userTest, 'warn', new Date, reason);
            const warnedUser = bot.guilds.get(info.settings.home_server_id).members.get(userTest); //.addRole(info.settings.warn_role_id)
            if(warnedUser) {
              bot.createMessage(details.channelID,{content:`${details.args[1]}, you have been warned for: ${reason}`});
              bot.createMessage(info.settings.private_log_channel, {embed: {title: 'Log', fields: [{name: 'User', value: details.args[1]}, {name: 'Action', value: 'warn'} ,{name: 'Reason', value: reason}, {name: 'Responsible Mod', value: `<@${details.userID}>`}]}});
              warnedUser.addRole(info.settings.warn_role_id);
            }
            
          }

        }
      }
    }
  }, requires);
};
