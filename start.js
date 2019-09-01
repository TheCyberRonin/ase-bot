'use strict';
const Bot = require('./src/structures/Bot');
const config = require('./config.json');
config.feathers = require('./feathers.json');
const appSettings = require('./package.json');
config.version = appSettings.version;

const bot = new Bot({
  config: config
});