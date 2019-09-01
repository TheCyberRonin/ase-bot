'use strict';
const Command = require('../structures/Command');

//loads the settings fromt he db
module.exports = function command(requires)
{
  return new Command({
    name: 'Load Settings',
    inline: true,
    alias: ['ls'],
    blurb: 'Loads the settings to the db',
    permission: 'private',
    action: function(details)
    {
      const db = requires.info.db;
      let settingsObj = {};
      db.getSettings().then(settings => {
        const len = settings.length;
        settings.forEach((setting, index) => {
          settingsObj[setting._id] = setting.value;
          if(index === len -1) {
            requires.info.settings = settingsObj;
          }
        });
        requires.bot.createMessage(details.channelID, {content: 'Settings loaded'});
      });
    }
  }, requires);
};
