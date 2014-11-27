'use strict';

module.exports = Bot;

var Q = require('q');
var http = require('http');
var irc = require('irc');
var request = require('request');
var _ = require('underscore');
var Datastore = require('nedb');

var PluginLoader = require('./pluginLoader');


/**
 * Bot class
 */
function Bot(config) {
  var that = this;

  that.nick = config.nick || 'zoobot';
  that.network = config.server || '127.0.0.1';
  that.channels = config.channels;
  that.extraPlugins = config.plugins || [];
  that.help = {};
  that.buffer = {};
  that.plugins = ['intro'].concat(that.extraPlugins);
  that.channels.forEach(function(channel, index) {
    that.buffer[channel] = '';
  });

  that.client = new irc.Client(that.network, that.nick, {
    autoConnect: false
  });

  that.pluginLoader = new PluginLoader(that);

  that.addErrorListener();

  that.plugins.forEach(function(plugin, index) {
    that.pluginLoader.load(plugin);
  });
}

// Connect to the server and channels, returns a Promise
Bot.prototype.connect = function() {
  var that = this;
  return Q.Promise(function(resolve, reject) {
    that.client.connect(5, function(input) {
      that.channels.forEach(function(channel, index, channels) {
        that.client.join(channel, function(input) {
          if (index == (channels.length - 1)) {
            resolve('done');
          }
        });
      });
    });
  });
};

// Add join listener
Bot.prototype.addJoinListener = function() {
  var that = this;
  that.client.addListener('join', function (channel, nick) {
    if (nick !== that.nick) {
      that.buffer[channel] = nick + ' has joined';
    }
  });
};

// Add part listener
Bot.prototype.addPartListener = function() {
  var that = this;
  that.client.addListener('part', function (channel, nick, reason) {
    if (nick !== that.nick) {
      that.buffer[channel] = nick + ' has left(' + reason + ')';
    }
  });
};

// Add error listener
Bot.prototype.addErrorListener = function() {
  var that = this;
  that.client.addListener('error', function(message) {
    console.log('error: ' + message);
  });
};

// Send message to a channel
Bot.prototype.say = function(channel, msg) {
  var that = this;
  that.client.say(channel, msg);
};

// Send an action message to a channel
Bot.prototype.action = function(channel, msg) {
  var that = this;
  that.client.action(channel, msg);
};

// Part from a channel
Bot.prototype.part = function(channel, msg) {
  var that = this;
  that.client.part(channel, msg);
};

// Join a channel
Bot.prototype.join = function(channel) {
  var that = this;
  that.client.join(channel);
};

// Kill the bot
Bot.prototype.kill = function() {
  var that = this;
  that.client.disconnect('killed');
};


Bot.prototype.addMessageListener = function(callback) {
  var that = this;
  that.client.addListener('message', function(from, to, text) {
    callback.call(that, from, to, text);
  });
};
