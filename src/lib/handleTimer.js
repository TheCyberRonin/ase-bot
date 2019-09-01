module.exports = (requires) => {
  const { info, bot } = requires;

  const handler = {};
  function searchForMuted(roles) {
    roles.includes(info.settings.mute_role_id)
  }
  function unmuteUser(userID) {
    const user = bot.guilds.get(info.settings.home_server_id).members.get(userID);
    if(user !== undefined) {
      const isMuted = user.roles.includes(info.settings.mute_role_id);
      if(isMuted) {
        user.removeRole(info.settings.mute_role_id, 'Mute timer expired');
        bot.createMessage(info.settings.public_log_channel, {content: `<@${userID}>, you have been unmuted.`});
      }
    }
  }
  function processPassed(passed) {
    passed.forEach(timer => {
      switch(timer.type) {
        case 'mute':
          unmuteUser(timer.userID);
      }
    });
  }
  handler.processTick = () => {
    const now = new Date;
    //console.log('tick');
    info.db.findPassed(now).then(passedTimers => {
      processPassed(passedTimers);
      // do something, then delet passed Timers
      info.db.removePassed(now).then(numRemoved => {
        //console.log(numRemoved);
      }).catch(console.log);
    }).catch(console.log);
  };
  return handler;
}