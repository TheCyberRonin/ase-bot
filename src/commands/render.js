'use strict';
const fetch = require('node-fetch');
const Aseprite = require('ase-parser');
const Command = require('../structures/Command');
const sharp = require('sharp');
//renders an aseprite file and gives information about it
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

      function toEmbed(aseFile) {
        const fileName = aseFile.name.replace('.aseprite', '.png');
        const emb = { title: fileName};
        emb.image = {url: `attachment://${fileName}`}
        emb.fields = [];
        //size
        emb.fields.push({name: 'Size', value: aseFile.formatBytes(aseFile.fileSize, 2)});
        //framecount
        emb.fields.push({name: 'Frames', value: aseFile.numFrames});
        //width and height
        emb.fields.push({name: 'Dimensions', value: `${aseFile.width}X${aseFile.height}`});
        //pixel ratio
        emb.fields.push({name: 'Tags' ,value: aseFile.tags.length});
        return emb;
      }
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
                  bot.createMessage(details.channelID, { embed: toEmbed(ase) },{
                      file: finalBuff,
                      name: details.attachments[0].filename.replace('.aseprite', '.png')});
                })
              } else {
                sharp(values[0]).composite(stuff.map((img,index) => {
                  return {input: img, top: cels[index].ypos, left: cels[index].xpos };
                })).png().toBuffer().then(finalBuff => {
                  console.log('yeeet');
                  bot.createMessage(details.channelID, { embed: toEmbed(ase) },{
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
