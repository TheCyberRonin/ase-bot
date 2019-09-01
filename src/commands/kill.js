'use strict';
const Command = require('../structures/Command');

//Kills the bot, just in case it's acting up ;)
module.exports = function command(requires)
{
  return new Command({
    name: 'Kill',
    inline: true,
    alias: ['ki'],
    blurb: 'Kills the bot', 
    longDescription: 'Sometimes you just gotta do it ┐(´д｀)┌', 
    usages: ['`%prefixkill`'], 
    permission: 'private',
    action: function(details)
    {
      requires.bObj.kill();
    }
  }, requires);
};
