'use strict';
const Command = require('../structures/Command');

//command to list user roles and assign/remove user roles from users, by users.
module.exports = function command(requires)
{
  return new Command({
    name: 'User Role',
    inline: true,
    alias: ['ur'],
    blurb: 'Lists roles, or assigns/removes the role searched for',
    usages: ['`%prefixur` ― List self-assignable roles',
             '`%prefixur {role}` ― Gives you the role, or removes it if you already have it.'],
    permission: 'public',
    action: function(details)
    {
      const bot = requires.bot;
      const info = requires.info;

      //processes input
      if(details.input === "")
      {
        info.db.listRoles().then((roleNames) => {
          let emb = {}; 
          emb.title = 'User selectable roles.';
          emb.description = roleNames.join('\n');
          bot.createMessage(details.channelID, {embed: emb});
        });
      }
      else
      {
        //search for a role by name on the server
        info.utility.getRoleByName(details.serverID, details.input).then((roleID) =>
        {
          //search the DB to see if it's assignable
          info.db.searchRoleByID(roleID).then((roleEntry) =>
          {
            if(roleEntry === null)
            {
              bot.createMessage(details.channelID, {embed: {title: 'Error', description: 'Role is not self assignable.',
              color: info.utility.red}});
            }
            else
            {
              //if they don't already have the role, give it to them.
              let memberRoles = bot.guilds.get(details.serverID).members.get(details.userID).roles;
              let roleSearch = memberRoles.find(memberRole => memberRole === roleID);
              if(roleSearch === undefined)
              {
                bot.guilds.get(details.serverID).members.get(details.userID).addRole(roleID).then((result) =>
                {
                  let emb = {};
                  emb.title = 'Success';
                  emb.description = `The __${details.input}__ role has been added.`;
                  emb.color = info.utility.green;
                  bot.createMessage(details.channelID, {embed: emb});
                }).catch((err) =>
                {
                  bot.createMessage(details.channelID, {embed: {title: 'Error', description: 'Error adding role.',
                  color: info.utility.red}});
                });
              }
              //if they already have the role, remove it.
              else
              {
                bot.guilds.get(details.serverID).members.get(details.userID).removeRole(roleID).then((result) => 
                {
                  bot.createMessage(details.channelID, {embed: {title: 'Removed', description: `The __${details.input}__ role has been removed.`,
                  color: info.utility.red}});
                }).catch((err) => {
                  bot.createMessage(details.channelID, {embed: {title: 'Error', description: 'Error removing role.',
                  color: info.utility.red}});
                });
              }
            }

          }).catch((err) => {
            bot.createMessage(details.channelID, {embed: {title: 'Error', description: 'Role is not self assignable.',
              color: info.utility.red}});
          });
          
        }).catch((err) =>
        {
          bot.createMessage(details.channelID, {embed: {title: 'Error', description: 'Role does not exist.',
              color: info.utility.red}});
        });
      }
    }
  }, requires);
};
