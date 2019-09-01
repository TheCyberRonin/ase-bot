/**
 * @file Command loader class file.
 * @author Ronin
 */
'use strict';

const Loader = require('./Loader');
const fs = require('fs');

class CommandLoader extends Loader
{
  constructor(location)
  {
    super(location);
    this.privates = [];
  }
  /**
   * Loads the files into an object
   * @function
   * @param {Object} passing - Contains what should be passed down to the files.
   * @param {Object} passing.bot - Discord.io bot instance.
   * @param {Object} passing.info - Generic info kept by Bot.
   * @param {Object} passing.bObj - Bot object (for custom emitters).
   * @returns {Promise<Object>} - Promise returns an object containing the file names as keys.
   */
  load(passing)
  {
    let dir = this.location;
    return new Promise((resolve, reject) =>
    {
      fs.readdir(dir, (err, files) =>
      {
        if(err) reject(err);
        let filteredFiles = files.filter((file) => { return file.endsWith('.js'); });
        filteredFiles.forEach((fName) =>
        {
          let itemName = fName.slice(0,-3);
          this.items[itemName] = require(`${dir}/${fName}`)(passing);
        });
        Object.keys(this.items).forEach((comm) =>
        {
          if(this.items[comm].getPerm() === 'private')
          {
            this.privates.push(comm);
          }
        });
        resolve({commands: this.items, privates: this.privates});
      });
    });
  }
}
module.exports = CommandLoader;
