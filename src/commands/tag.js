'use strict';
const Command = require('../structures/Command');

//command to list tags, or display a specific tag
module.exports = function command(requires)
{
  return new Command({
    name: 'Tag',
    inline: true,
    alias: ['t'],
    blurb: 'Retrieves important texts', 
    longDescription: 'Lists tags, or displays the content of a specific tag.', 
    usages: ['`%prefixt` ― Shows a list of all available tags',
             '`%prefixt {tag name}` ― Retrieves {tag name} '], 
    permission: 'public',
    action: function(details)
    {
      const bot = requires.bot;
      const info = requires.info;

      //processes input
      if(details.input === "")
      {
        info.db.listTags().then((tagNames) =>
        {
          let emb = {};
          emb.title = 'Tags.';
          emb.description = tagNames.join('\n');
          bot.createMessage(details.channelID, {embed: emb});
        });
      }
      else
      {
        info.db.searchTag(details.input).then((tag) =>
        {
          if(tag === null)
          {
            let errEmb = {};
            errEmb.title = 'Error';
            errEmb.description = `No __${details.input}__ tag found.`;
            errEmb.color = info.utility.red;
            bot.createMessage(details.channelID, {embed: errEmb});
          }
          else
          {
            bot.createMessage(details.channelID, tag.content);
          }
        });
      }
    }
  }, requires);
};
