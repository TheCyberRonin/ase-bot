//Feather for getting user info to display nice
'use strict';
module.exports = function feather(requires)
{
  //feather obj
  const feather = {};
  
  //requires
  const bot = requires.bot;
  //feather functions
  feather.getInfo = function(details, uid) {
    let emb = {};
    emb.title = bot.users.get(uid).username + "'s Info";
    emb.description = '\n _ _';
    let server = bot.guilds.get(details.serverID);
    let extras = false;
    if(server != undefined) {
      extras = true;
    }
    let thumbnail = {url: getAvatar(uid)};
    emb.thumbnail = thumbnail;

    let fields = [];

    if(extras) {
      if(server.members.get(uid).nick) {
        let nickname = {name: "Nickname:", value: server.members.get(uid).nick};
        fields.push(nickname);
      }          
      let joined = {name: "Joined", value: getJoinedTime(details, uid)};
      fields.push(joined);
    }

    let created = {name: "Created:", value: getCreatedTime(uid)};
    fields.push(created);
    if(server.members.get(uid).game != null) {
      let playing = {name: 'Playing:', value: server.members.get(uid).game.name};
      fields.push(playing);
    }

    emb.fields = fields;
    return emb;
  };
  //helper functions
  const getCreatedTime = function(uid) {
    let t = (uid / 4194304) + 1420070400000;
    let created = new Date(t);
    return `${created.toUTCString()}`;
  };
  const getJoinedTime = function(details, uid) {
    let d = new Date(bot.guilds.get(details.serverID).members.get(uid).joinedAt);
    let localOffset = 5 * 60000;
    let utc = d.getTime() + localOffset;
    let dUTC = new Date(utc);
    return `${d.toUTCString()}`;
  };
  const getAvatar = function(uid) {
    let ava = undefined;
    let userAva = bot.users.get(uid).avatar;
    if(userAva === null) return `https://cdn.discordapp.com/embed/avatars/${parseInt(bot.users.get(uid).discriminator, 10) % 5}.png`
    if(userAva.startsWith('a_')) {
      ava = 'https://cdn.discordapp.com/avatars/' +uid+'/'+userAva+'.gif';
    } else {
      ava = 'https://cdn.discordapp.com/avatars/' +uid+'/'+userAva+'.webp';
    }
    return ava;
  };

  return feather;
};
