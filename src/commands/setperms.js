'use strict';
const Command = require('../structures/Command');

//command to add roleIDs or userIDs to a perm level
module.exports = function command(requires)
{
  return new Command({
    name: 'Set Perms',
    inline: true,
    alias: ['sp'],
    blurb: 'Adds a role or user ID to the associated perm.',
    permission: 'private',
    action: function(details)
    {
      const bot = requires.bot;
      const info = requires.info;

      function success(numReplaced) {
        if(numReplaced === 1) {
          let emb = {};
          emb.title = 'Success';
          emb.description = `You have added the user or role to the permission level.`;
          emb.color = info.utility.green;
          bot.createMessage(details.channelID, {embed: emb});
        } else {
          let emb = {};
          emb.title = 'Failed';
          emb.description = `Something went wrong with adding the user/role.`;
          emb.color = info.utility.red;
          bot.createMessage(details.channelID, {embed: emb});
        }
      }
      
      function successRemove(numReplaced) {
        if(numReplaced === 1) {
          let emb = {};
          emb.title = 'Success';
          emb.description = `You have removed the user or role to the permission level.`;
          emb.color = info.utility.green;
          bot.createMessage(details.channelID, {embed: emb});
        } else {
          let emb = {};
          emb.title = 'Failed';
          emb.description = `Something went wrong with removing the user/role.`;
          emb.color = info.utility.red;
          bot.createMessage(details.channelID, {embed: emb});
        }
      }

      //processes input
      if(details.input === "") {return;}
      else
      {
        if(details.args.length === 4) {
          if(details.args[1] === 'low' || details.args[1] === 'high') {
            if(details.args[2] === 'user' || details.args[2] === 'role') {
              info.db.findPerm(details.args[3], [details.args[3]]).then(perm => {
                if(perm === null) {
                  details.args[2] === 'user' ?
                    info.db.addPermUser(details.args[1], details.args[3]).then(success) :
                    info.db.addPermRole(details.args[1], details.args[3]).then(success);
                }
                else {
                  details.args[2] === 'user' ?
                    info.db.removePermUser(details.args[1], details.args[3]).then(successRemove) :
                    info.db.removePermRole(details.args[1], details.args[3]).then(successRemove);
                }
              });
            }
          }
        } else {return};
      }
    }
  }, requires);
};
