'use strict';
const Command = require('../structures/Command');

//command to get a users infractions
module.exports = function command(requires)
{
  return new Command({
    name: 'Rapsheet',
    inline: true,
    alias: ['rs'],
    blurb: 'Get\'s a user\'s infractions.',
    permission: 'low',
    action: function(details)
    {
      const bot = requires.bot;
      const info = requires.info;
      const userFeather = info.utility.useSource('user');

      function processInfractions(infractions) {
        const len = infractions.length;
        const lastFive = len - 5;
        let warns = 0, mutes = 0;
        let fields = [];
        let lastInfractions = {name: 'Latest infractions'};
        let lastFiveInfractions = [];
        infractions.forEach((infraction, index) => {
          if(infraction.type === 'mute') {
            mutes ++;
          } else if(infraction.type === 'warn') {
            warns ++;
          }
          if(index >= lastFive) {
            lastFiveInfractions.push(`${infraction.type}: ${infraction.reason} - ${infraction.time.toUTCString()}`);
          }
        });
        lastInfractions.value = lastFiveInfractions.join('\n');
        fields.push({name: 'Mute(s)', value: mutes, inline: true});
        fields.push({name: 'Warn(s)', value: warns, inline: true});
        fields.push(lastInfractions);
        return fields;
      }
      //processes input
      if(details.input === "") {return;}
      else {
        if(details.args.length === 2) {
          const userTest = info.utility.stripUID(details.args[1]);
          if(userTest) {
            let userEmb = userFeather.getInfo(details, userTest);
            info.db.getInfractions(userTest, userTest).then(stuff => {
              if(stuff === null) {
                bot.createMessage(details.channelID, {embed: userEmb});
              } else {
                userEmb.fields = processInfractions(stuff.infractions, userTest).concat(userEmb.fields);
                userEmb.color = 0xFF0000;
                userEmb.title = `${bot.users.get(userTest).username}'s Rapsheet`;
                bot.createMessage(details.channelID, {embed: userEmb});
              }
              
            })
          }
        }
      }
    }
  }, requires);
};
