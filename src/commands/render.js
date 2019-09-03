'use strict';
const fetch = require('node-fetch');
const Command = require('../structures/Command');
const sharp = require('sharp');
//Kills the bot, just in case it's acting up ;)
module.exports = (requires) => {
  return new Command({
    name: 'Render',
    inline: true,
    alias: ['re'],
    blurb: 'Renders a layer of an aseprite file',
    longDescription: 'Renders a layer of an aseprite file.', 
    usages: ['`%prefixrender (with an attachment of an aseprite file)`'], 
    permission: 'public',
    action: (details) => {
      const bot = requires.bot;
      const info = requires.info;
      const Aseprite = require('../structures/Aseprite');

      console.log(details);
      if (details.attachments) {
        console.log(details.attachments[0]);
        fetch(details.attachments[0].url).then(res => {
          return res.buffer()
        }).catch(err => {
          console.log(err);
        }).then(buffer => {
            const ase = new Aseprite(buffer, details.attachments[0].filename);
            ase.parse();
            const bgPromise = sharp({create: {
              width: ase.width,
              height: ase.height,
              channels: 4,
              background: {r: 0, g: 0, b: 0, alpha: 0}
            }}).png().toBuffer();
            let cels = ase.frames[0].cels;
            let otherPromises;
            if (details.args.length > 1) {
              const multiplier = parseInt(details.args[1], 10);
              otherPromises = cels.map(cel => {
                return sharp(cel.rawCelData, {raw: {width: cel.w, height: cel.h, channels: 4}}).png().resize(cel.w * multiplier, ase.height * multiplier, {fit: 'inside', kernel: 'nearest'}).toBuffer();
              });
            } else {
              otherPromises = cels.map(cel => {
                return sharp(cel.rawCelData, {raw: {width: cel.w, height: cel.h, channels: 4}}).png().toBuffer();
              });
            }

            Promise.all([bgPromise, ...otherPromises]).then((values) => {
              let stuff = values.slice(1);
              if (details.args.length > 1) {
                const multiplier = parseInt(details.args[1], 10);
                sharp(values[0]).composite(stuff.map((img,index) => {
                  return {input: img, top: cels[index].ypos * multiplier, left: cels[index].xpos * multiplier };
                })).png().resize(ase.width * multiplier, ase.height * multiplier, {fit: 'inside', kernel: 'nearest'}).toBuffer().then(finalBuff => {
                  console.log('yeeet');
                  bot.createMessage(details.channelID, { embed: ase.toEmbed() },{
                      file: finalBuff,
                      name: details.attachments[0].filename.replace('.aseprite', '.png')});
                })
              } else {
                sharp(values[0]).composite(stuff.map((img,index) => {
                  return {input: img, top: cels[index].ypos, left: cels[index].xpos };
                })).png().toBuffer().then(finalBuff => {
                  console.log('yeeet');
                  bot.createMessage(details.channelID, { embed: ase.toEmbed() },{
                      file: finalBuff,
                      name: details.attachments[0].filename.replace('.aseprite', '.png')});
                })
              }
            }).catch(console.log);


          }).catch(err => {
            console.log(err);
          })
      }
    }
  }, requires);
};