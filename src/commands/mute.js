'use strict';
const Command = require('../structures/Command');

//command to mute w/time
module.exports = function command(requires)
{
  return new Command({
    name: 'Mute',
    inline: true,
    alias: ['m'],
    blurb: 'Mutes people.',
    usages: ['`%prefixm {user} {time} {reason}`'],
    permission: 'low',
    action: function(details)
    {
      const bot = requires.bot;
      const info = requires.info;
      const timeReg = /\d+(d|m|h)/g;
      const number = /\d+/g;
      const wholeTest = /<\@!*([a-zA-Z0-9]+)>\s\d+(d|m|h)\s\w.+/g;
      const idAndTime = /<\@!*([a-zA-Z0-9]+)>\s\d+(d|m|h)\s/g;
      //processes input
      if(details.input === "") {return;}
      else
      {
        if(!wholeTest.test(details.input)) {
          return;
        } else {
          const test = timeReg.exec(details.args[2]);
          const userTest = info.utility.stripUID(details.args[1]);
          if(userTest) {
            if(test !== null) {
              const amount = parseInt(test[0].replace(test[1], ''));
              let muteEnd = new Date;
              switch(test[1]) {
                case 'm':
                  muteEnd.setMinutes(muteEnd.getMinutes() + amount);
                  console.log(muteEnd, userTest);
                  break;
                case 'h':
                  muteEnd.setHours(muteEnd.getHours() + amount);
                  console.log(muteEnd, userTest);
                  break;
                case 'd':
                muteEnd.setDate(muteEnd.getDate() + amount);
                  console.log(muteEnd, userTest);
                  break;
              }
              info.db.addTimer(userTest, 'mute', muteEnd);
              info.db.addInfraction(userTest, 'mute', new Date, details.input.replace(idAndTime, ''));
              const mutedUser = bot.guilds.get(info.settings.home_server_id).members.get(userTest);
              if(mutedUser !== undefined) {
                bot.createMessage(details.channelID, {content: `User will be muted until ${muteEnd.toUTCString()}`});
                bot.createMessage(info.settings.private_log_channel, {embed: {title: 'Log', fields: [{name: 'User', value: details.args[1]}, {name: 'Action', value: 'mute'} , {name: 'Length', value: test[0]}, {name: 'Reason', value: details.input.replace(idAndTime, '')}, {name: 'Responsible Mod', value: `<@${details.userID}>`}]}});
                mutedUser.addRole(info.settings.mute_role_id, details.input.replace(idAndTime, ''));
              }
              
            }
          }

        }
      }
    }
  }, requires);
};
