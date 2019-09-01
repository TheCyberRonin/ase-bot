/**
 * @file Feather class file.
 * @author Ronin
 */
'use strict';

/**
 * Creates a Plugin. Adds additional functionality to a Bot.
 * @class
 */
class Feather
{
  /**
   * Constructor for Plugin
   * @param {Object} requires - Object to hold the requires.
   * @param {Object} about - Object to hold the info.
   * @param {String} about.description - Description of the Plugin.
   */
  constructor(requires, info)
  {
    this.description = info.description;
  }

  setFuncts(functions)
  {
    this.functs(this.requires);
  }

}
module.exports = Feather;
