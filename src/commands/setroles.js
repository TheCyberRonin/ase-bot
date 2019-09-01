'use strict';
const Command = require('../structures/Command');

//command to enable selectable roles
module.exports = function command(requires)
{
  return new Command({
    name: 'Set Roles',
    inline: true,
    alias: ['sr'],
    blurb: 'Sets available user roles for self-assignment.', 
    longDescription: 'Given a role name, makes it self-assignable. Using it with a role that is already set, will make it no longer be self-assignable.', 
    usages: ['`%prefixsr {role name}` ― Toggles whether role is self-assignable'], 
    permission: 'high',
    action: function(details)
    {
      const bot = requires.bot;
      const info = requires.info;

      //processes input
      if(details.input === "") {return;}
      else
      {
        info.utility.getRoleByName(details.serverID, details.input).then((roleID) =>
        {
          info.db.addRole(roleID, details.input).then((dbrole) =>
          {
            let emb = {};
            emb.title = 'Success';
            emb.description = `You have added the __${details.input}__ role to the user selectable roles.`;
            emb.color = info.utility.green;
            bot.createMessage(details.channelID, {embed: emb});
          }).catch((err) =>
          {
            if(err.errorType === 'uniqueViolated')
            {
              info.db.removeRoleByID(roleID).then((numRemoved) => {
                let remEmb = {};
                remEmb.title = 'Removed';
                remEmb.description = `You have removed the __${details.input}__ role from the user selectable roles`;
                remEmb.color = info.utility.red;
                bot.createMessage(details.channelID, {embed: remEmb});
              }).catch((err) => {
                console.log(err);
              });
            }
            console.log(err.errorType);
          });
        }).catch((err) =>
        {
          console.log(err);
        });
      }
    }
  }, requires);
};
