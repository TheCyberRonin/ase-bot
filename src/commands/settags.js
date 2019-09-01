'use strict';
const Command = require('../structures/Command');

//command to enable selectable roles
module.exports = function command(requires)
{
  return new Command({
    name: 'Set Tags',
    inline: true,
    alias: ['st'],
    blurb: 'Stores text for easy retrieval', 
    longDescription: 'Creates a retrivable message. Don\'t forget the `:` when creating a tag.  Calling without `:` and additional text removes a tag.', 
    usages: ['`%prefixst {tag name}: {text}` ― Creates {tag name} tag that will return {text}',
            '`%prefixst {tag name}` ― Removes {tag name}'], 
    permission: 'low',
    action: function(details)
    {
      const bot = requires.bot;
      const info = requires.info;

      //processes input
      if(details.input === "") {return;}
      else
      {
        let nameParse = details.input.match(/[\w\s]+:\s/g);
        if(nameParse !== null)
        {
          let tagName = nameParse[0].replace(': ', '');
          let content = details.input.replace(nameParse[0], '');
          info.db.addTag(tagName, content).then((newTag) =>
          {
            let emb = {};
            emb.title = 'Success';
            emb.description = `You have added the __${tagName}__ tag.`;
            emb.color = info.utility.green;
            bot.createMessage(details.channelID, {embed: emb});
          }).catch((err) =>
          {
            let errEmb = {};
            errEmb.title = 'Failed';
            errEmb.description = `You have failed to add the __${tagName}__ tag.`;
            errEmb.color = info.utility.red;
            bot.createMessage(details.channelID, {embed: emb});
            console.log(err.errorType);
          });
        }
        else
        {
          info.db.removeTag(details.input).then((numRemoved) =>
          {
            if(numRemoved === 1)
            {
              let remEmb = {};
              remEmb.title = 'Removed';
              remEmb.description = `You have removed the __${details.input}__ tag.`;
              remEmb.color = info.utility.red;
              bot.createMessage(details.channelID, {embed: remEmb});
            }
            else if(numRemoved === 0)
            {
              let remErrEmb = {};
              remErrEmb.title = 'Error';
              remErrEmb.description = `There was no __${details.input}__ tag to remove`;
              remErrEmb.color = info.utility.red;
              bot.createMessage(details.channelID, {embed: remErrEmb});
            }
          }).catch((err) =>
          {
            console.log(err);
          });
        }
      }
    }
  }, requires);
};
