'use strict';
module.exports = (requires) => {
  const utilities = {};
  const bot = requires.bot;
  const info = requires.info;
  const config = info.config;
  
  utilities.useSource = (feather) => {
    if(info.feathers[feather]) {
      return info.feathers[feather];
    } else {
      return false;
    }
  };
  //Gets a role by name
  utilities.getRoleByName = (serverID, name) => {
    return new Promise((resolve, reject) => {
      bot.guilds.get(serverID).roles.forEach((role) => {
        if(bot.guilds.get(serverID).roles.get(role.id).name.toLowerCase() === name.toLowerCase()) {
          resolve(role.id);
        }
      });
      reject('Role name not found.');
    });
  };
  //Wraps a string in 3 backticks to make a code block
  utilities.codeBlock = (str,style) => {
    return `\`\`\`${style || ''}\n${str}\n\`\`\``;
  };
  //wraps a string to add one backtick to each side to make an inline code block
  utilities.codeInline = (str) => {
    return `\`${str}\``;
  };
  //Prints all of the roles in a server
  utilities.printRoles = (sid) => {
    let serv = '';
    let r = '';
    let roleStr = '';
    for(r in bot.servers[sid].roles) {
      roleStr += ('Name: ' + bot.servers[sid].roles[r].name + ' ID: ' + bot.servers[sid].roles[r].id + '\n');
    }
    return roleStr;
  };
  //Searches for an item in an array
  utilities.searchArr = (array, item) => {
    for(let i = 0; i < array.length; i ++) {
      if(item == array[i]) {
        return true;
      }
    }
    return false;
  };

  //Checks to see if a message would be a command (Starts with the prefix)
  utilities.isCommandForm = (message) => {
    return message.startsWith(config.prefix);
  };

  //Removes the prefix from the message
  utilities.stripPrefix = (message) => {
    if(message.startsWith(config.prefix)) {
      message = message.replace(config.prefix,'');
    }
    return message;
  };
  //Formats bytes.
  utilities.formatBytes = (bytes,decimals) => {
    if (bytes === 0) {
      return '0 Byte';
    }
    const k = 1024;
    const dm = decimals + 1 || 3;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  //checks to see if the user that called a command is an Admin
  utilities.isAdministrator = (userID) => {
    return config.administrators.indexOf(userID) > -1;
  };
  //returns the userID of a mention
  utilities.stripUID = (userString) => {
    let userID = false;
    if (userString !== '')
    {
            //did we provide a mention?
      let regexp = /<\@!*([a-zA-Z0-9]+)>/g;
      let match = regexp.exec(userString);
      if (match)
      {
        userID = match[1];
      }
      else
      {
        userID = false;
      }
    }
    return userID;
  };
  //gets the role(s) of a userID, using sid for the serverID just in case the bot is on more than one
  utilities.getRole = (uid, sid) => {
    let roles = [];
    roles = bot.servers.get(sid).members.get(uid).roles;
    return roles;
  };
  //gets serverID
  utilities.getServerID = (channelID) => {
    return bot.channels[channelID].guild_id;
  };
  //split message into 3 parts, [username, identifier, reason]
  utilities.splitMessage = (str) => {
    const patt = /.+#[0-9]{4}/g;
    var result = patt.exec(str);
    let resultArr = [];
    if(result === null) {
      return false;
    } else {
      resultArr = result[0].split('#');
      resultArr.push(str.replace(result[0],'').replace(' ',''));
      return resultArr;
    }
  };
  //replaces %prefix with the prefix from config
  utilities.filter = (str) => {
    return str.replace('%prefix', config.prefix);
  };

  //for finding the command object for either the keyword or an alias 
  utilities.getCommand = (keyword) => { 
    let commands = info.commands;
    if(commands[keyword] && typeof commands[keyword].getAction() === 'function') { 
      return commands[keyword]; 
    } else { 
      //didn't find command 
      for(let index in commands) { 
        if(commands[index] && typeof commands[index] === 'object'
           && commands[index].getAlias().indexOf(keyword) > -1) { 
          return commands[index]; 
        } 
      } 
    } 
    return null; 
  };

  utilities.getPermLevel = (details) => {
    return new Promise((resolve, reject) => {
      let db = info.db;
      let roles = details.member ? details.member.roles : [];
      if(details.isAdministrator) {
        resolve('private');
      } else {
        db.findPerm(details.userId, roles).then(perm => {
          if(perm != null) {
            resolve(perm._id);
          } else {
            resolve('public');
          }
        }).catch(console.log);
      }
    });
  };

  utilities.hasPermission = (commandLevel, userLevel) => {
    switch (userLevel) {
    case 'private':
      return true;
    case 'high':
      if(commandLevel != 'private') {
        return true;
      }
      break;
    case 'low':
      if(commandLevel === 'low' || commandLevel === 'public'){
        return true;
      }
      break;
    case 'public':
      if(commandLevel === 'public') {
        return true;
      }
      break;
    }
    // there is no `default` above, but if somehow `userLevel` is
    // not one of the expected strings, it'll still fallback here
    // and default to false
    return false;    
  };
  
  utilities.red = 0xFF0000;
  utilities.green = 0x25bf06;
  return utilities;
};
