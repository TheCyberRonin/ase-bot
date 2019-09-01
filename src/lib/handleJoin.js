module.exports = (requires) => {
  const { info, bot } = requires;

  const handler = {};
  function muteUser(userID) {
    const user = bot.guilds.get(info.settings.home_server_id).members.get(userID);
    if(user !== undefined) {
      const isMuted = user.roles.includes(info.settings.mute_role_id);
      if(!isMuted) {
        user.addRole(info.settings.mute_role_id, 'User left while muted');
        bot.createMessage(info.settings.public_log_channel, {content: `<@${userID}>, you have been muted again because you left and joined while your mute wasn't finished.`});
      }
    }
  }
  handler.processJoin = (guild, member) => {
    if(guild.id === info.settings.home_server_id) {
      info.db.getUserTimer(member.id).then(timers => {
        if(timers.length !== 0) {
          muteUser(member.id);
        }
      });
    }
  };
  return handler;
}
