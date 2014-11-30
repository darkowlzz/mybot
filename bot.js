'use strict';

module.exports = Bot;

var Q = require('q');
var irc = require('irc');
var _ = require('underscore');
var Datastore = require('nedb');

var PluginLoader = require('./pluginLoader');

var DEFAULT_PLUGINS = ['intro', 'join', 'part', 'error'];


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
  that.plugins = DEFAULT_PLUGINS.concat(that.extraPlugins);
  that.channels.forEach(function(channel, index) {
    that.buffer[channel] = '';
  });

  that.client = new irc.Client(that.network, that.nick, {
    autoConnect: false
  });

  that.pluginLoader = new PluginLoader(that);

  that.plugins.forEach(function(plugin, index) {
    that.pluginLoader.load(plugin);
  });
}

// Connect to the server and channels, returns a Promise
Bot.prototype.connectAll = function() {
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

/*--------------------------------------------------------------------------*/

// Join a channel
Bot.prototype.join = function(channel) {
  var that = this;
  that.client.join(channel);
};

// Part from a channel
Bot.prototype.part = function(channel, msg) {
  var that = this;
  that.client.part(channel, msg);
};

// Send message to a channel
Bot.prototype.say = function(channel, msg) {
  var that = this;
  that.client.say(channel, msg);
};

// Send CTCP message to a channel
Bot.prototype.ctcp = function(channel, type, msg) {
  var that = this;
  that.client.ctcp(target, type, msg);
};

// Send an action message to a channel
Bot.prototype.action = function(channel, msg) {
  var that = this;
  that.client.action(channel, msg);
};

// Send a notice to a channel
Bot.prototype.notice = function(channel, msg) {
  var that = this;
  that.client.notice(channel, msg);
};

// Send a whois to a channel
Bot.prototype.whois = function(nick, callback) {
  var that = this;
  that.client.whois(nick, function(nick) {
    callback.call(that, nick);
  });
};

// Connect to the server
Bot.prototype.connect = function(retryCount, callback) {
  var that = this;
  that.client.connect(retryCount, function(input) {
    callback.call(that, input);
  });
};

// Disconnect from the server
Bot.prototype.disconnect = function(message, callback) {
  var that = this;
  that.client.disconnect(message, function(input) {
    callback.call(that, input);
  });
};

// Kill the bot
Bot.prototype.kill = function() {
  var that = this;
  that.client.disconnect('killed');
};

/*---------------------------------------------------------------------------*/

/**
 * Adds 'registered' event listener.
 */
Bot.prototype.addRegisteredListener = function(callback) {
  var that = this;
  that.client.addListener('registered', function(message) {
    callback.call(that, message);
  });
};

/**
 * Adds 'motd' event listener.
 */
Bot.prototype.addMotdListener = function(callback) {
  var that = this;
  that.client.addListener('motd', function(motd) {
    callback.call(that, motd);
  });
};

/**
 * Adds 'names' event listener.
 */
Bot.prototype.addNamesListener = function (callback) {
  var that = this;
  that.client.addListener('names', function(channel, nick) {
    callback.call(that, channel, nick);
  });
};

/**
 * Adds 'topic' event listener.
 */
Bot.prototype.addTopicListener = function (callback) {
  var that = this;
  that.client.addListener('topic', function(channel, topic, nick) {
    callback.call(that, channel, topic, nick);
  });
};

/**
 * Adds 'join' event listener.
 */
Bot.prototype.addJoinListener = function (callback) {
  var that = this;
  that.client.addListener('join', function(channel, nick) {
    callback.call(that, channel, nick);
  });
};

/**
 * Adds 'part' event listener.
 */
Bot.prototype.addPartListener = function (callback) {
  var that = this;
  that.client.addListener('part', function(channel, nick, reason) {
    callback.call(that, channel, nick, reason);
  });
};

/**
 * Adds 'quit' event listener.
 */
Bot.prototype.addQuitListener = function (callback) {
  var that = this;
  that.client.addListener('quit', function(nick, reason, channels) {
    callback.call(that, nick, reason, channels);
  });
};

/**
 * Adds 'kick' event listener.
 */
Bot.prototype.addKickListener = function (callback) {
  var that = this;
  that.client.addListener('kick', function(channel, nick, by, reason) {
    callback.call(that, channel, nick, by, reason);
  });
};

/**
 * Adds 'kill' event listener.
 */
Bot.prototype.addKillListener = function (callback) {
  var that = this;
  that.client.addListener('kill', function(nick, reason, channels) {
    callback.call(that, nick, reason, channels);
  });
};

/**
 * Adds 'message' event listener.
 */
Bot.prototype.addMessageListener = function(callback) {
  var that = this;
  that.client.addListener('message', function(nick, to, text) {
    callback.call(that, nick, to, text);
  });
};

/**
 * Adds 'notice' event listener.
 */
Bot.prototype.addNoticeListener = function (callback) {
  var that = this;
  that.client.addListener('notice', function(nick, to, text) {
    callback.call(that, nick, to, text);
  });
};

/**
 * Adds 'ping' event listener.
 */
Bot.prototype.addPingListener = function (callback) {
  var that = this;
  that.client.addListener('ping', function(server) {
    callback.call(that, server);
  });
};

/**
 * Adds 'pm' event listener.
 */
Bot.prototype.addPmListener = function (callback) {
  var that = this;
  that.client.addListener('pm', function(nick, text) {
    callback.call(that, nick, text);
  });
};

/**
 * Adds 'ctcp' event listener.
 */
Bot.prototype.addCtcpListener = function (callback) {
  var that = this;
  that.client.addListener('ctcp', function(from, to, text, type) {
    callback.call(that, from, to, text, type);
  });
};

/**
 * Adds 'nick' event listener.
 */
Bot.prototype.addNickListener = function (callback) {
  var that = this;
  that.client.addListener('nick', function(oldnick, newnick, channels) {
    callback.call(that, oldnick, newnick, channels);
  });
};

/**
 * Adds 'invite' event listener.
 */
Bot.prototype.addInviteListener = function (callback) {
  var that = this;
  that.client.addListener('invite', function(channel, from) {
    callback.call(that, channel, from);
  });
};

/**
 * Adds '+mode' event listener.
 */
Bot.prototype.addPlusModeListener = function (callback) {
  var that = this;
  that.client.addListener('+mode', function(channel, by, mode, argument) {
    callback.call(that, channel, by, mode, argument);
  });
};

/**
 * Adds '-mode' event listener.
 */
Bot.prototype.addMinusModeListener = function (callback) {
  var that = this;
  that.client.addListener('-mode', function(channel, by, mode, argument) {
    callback.call(that, channel, by, mode, argument);
  });
};

/**
 * Adds 'whois' event listener.
 */
Bot.prototype.addWhoisListener = function (callback) {
  var that = this;
  that.client.addListener('whois', function(info) {
    callback.call(that, info);
  });
};

/**
 * Adds 'channellist_start' event listener.
 */
Bot.prototype.addChannellistStartListener = function (callback) {
  var that = this;
  that.client.addListener('channellist_start', function() {
    callback.call(that);
  });
};

/**
 * Adds 'channellist_item' event listener.
 */
Bot.prototype.addChannellistItemListener = function (callback) {
  var that = this;
  that.client.addListener('channellist_item', function(channel_info) {
    callback.call(that, channel_info);
  });
};

/**
 * Adds 'channellist' event listener.
 */
Bot.prototype.addChannellistListener = function (callback) {
  var that = this;
  that.client.addListener('channellist', function(channel_list) {
    callback.call(that, channel_list);
  });
};

/**
 * Adds 'error' event listener.
 */
Bot.prototype.addErrorListener = function (callback) {
  var that = this;
  that.client.addListener('error', function(message) {
    callback.call(that, message);
  });
};
