const EventEmitter = require('events').EventEmitter;

class Clock extends EventEmitter {
  // set default tickTime to 10 seconds
  constructor(tickTime = 10000) {
    super();
    this.timer = setInterval(() => {
      this.emit('tick');
    }, tickTime)
  }
}

module.exports = Clock;
