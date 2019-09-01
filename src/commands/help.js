'use strict';
const Command = require('../structures/Command');

//Help command
module.exports = function command(requires)
{
  return new Command({
    name: 'Help',
    inline: true,
    alias: ['?', 'h'],
    blurb: 'See function and usage of each command',
    longDescription: 'See usage details for commands or bring up a list of available commands',
    usages: ['`%prefixhelp` ― Shows list of commands with short descriptions',
             '`%prefixhelp {command}` ― Shows full help message for a specific command'],
    permission: 'public',
    action: function(details)
    {
      let bot = requires.bot;
      let info = requires.info;
      let utility = info.utility;
      let emb = {};
      emb.fields = [];
      emb.title = 'Help';
      emb.description = "You can DM the bot :heart:";
      
      const listCommands = function(userLevel)
      {        
        emb.title = 'Help';
        emb.blurb = "You can DM the bot :heart:";
        Object.keys(info.commands).forEach((commandName,index) => {
          let command = info.commands[commandName];
          let commandLevel = command.getPerm();                
          if(!utility.hasPermission(commandLevel, userLevel)) {
            return;
          }
          //create the entry in the embed
          const prefix = info.config.prefix;
          let aliases = '';
          if(command.getAlias()){
            let separator = ', ' + prefix;
            aliases = separator + command.getAlias().join(separator);
          }
          let field = {};
          field.name = `${prefix}${commandName}${aliases}`;
          field.value = command.blurb;
          field.inline = true; //info.commands[command].inline;
          emb.fields.push(field);
        });
        //seeeeend it once all of the commands are iterated through
        bot.createMessage(details.channelID, {
          embed: emb
        });     
      };
      
      const sendDetails = function(commandName, userLevel)
      {
        let command = utility.getCommand(commandName);
        if(command == null
           || !utility.hasPermission(command.getPerm(), userLevel)) {
          bot.createMessage(details.channelID, {
            embed: {
              title: 'No Such Command',
              description: 'Command could not be found or you do not have permission to use this command'
            }            
          });
        } else {
          emb.title = 'Info: ' + command.name;
          emb.description = command.blurb;
          let fieldIdx = 0;    
          emb.fields[fieldIdx] = {
            name: 'Description:',
            value: command.longDescription
          };
          if(command.usages.length > 0) {
            const filteredUsages = command.usages.map(usage => utility.filter(usage));
            emb.fields[1] = {
              name: 'Usages:',
              value: filteredUsages.join('\n')
            };            
          }
          bot.createMessage(details.channelID, {
            embed: emb
          });
        }
      };
      
      utility.getPermLevel(details).then((userLevel) => {        
        if(details.input === '') {
          listCommands(userLevel);
        } else {
          sendDetails(details.input, userLevel);
        }      
      }).catch(console.log);

    }
  }, requires);
};
