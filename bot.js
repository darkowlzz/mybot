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
  config = config || {};
  var that = this;

  that.nick = config.nick || 'mybot';
  that.server = config.server || '127.0.0.1';
  that.channels = config.channels || [];
  that.debug = (!! config.debug) || false;
  that.assemblePlugins(config.plugins);
  that.help = {};
  that.buffer = {};
  that.channels.forEach(function(channel, index) {
    that.buffer[channel] = '';
  });

  // Create a client object
  that.client = new irc.Client(that.server, that.nick, {
    autoConnect: false
  });

  // Create a plugin loader
  that.pluginLoader = new PluginLoader(that, module.parent);

  // Load the plugins
  that.plugins.forEach(function(plugin) {
    that.pluginLoader.load(plugin);
  });
}

Bot.prototype = {
  // Connect to the server and channels, returns a Promise
  connectAll: function() {
    var that = this;
    return Q.Promise(function(resolve, reject) {
      that.log('connecting to server', that.server);
      that.client.connect(5, function(input) {
        that.log('connected to server', that.server);
        that.channels.forEach(function(channel, index, channels) {
          that.client.join(channel, function(input) {
            that.log('joined ', channel);
            if (index == (channels.length - 1)) {
              resolve('done');
            }
          });
        });
      });
    });
  },

  // Asynchronous version of connectAll
  connectAllAsync: function(callback) {
    var that = this;
    that.log('connecting to server', that.server);
    that.client.connect(5, function (input) {
      that.log('connected to server', that.server);
      that.channels.forEach(function (channel, index, channels) {
        that.client.join(channel, function (input) {
          that.log('joined ', channel);
          if (index === (channels.length - 1)) {
            if (!! callback)
              callback();
          }
        });
      });
    });
  },

  /**
   * Logging method.
   *
   * @param {string} message - A string identifier
   * @param {array|string} args - An array of data to be printed
   */
  log: function (message, args) {
    if (this.debug) {
      console.log(message, args);
    }
  },

  /**
   * Assemble Plugins to be loaded.
   *
   * @param {array} plugins - An array of plugin names to be loaded.
   */
  assemblePlugins: function (plugins) {
    var that = this;
    if (plugins === null) {
      that.log('plugin is null', true);
      that.plugins = [];
    } else {
      plugins = plugins || [];
      that.plugins = DEFAULT_PLUGINS.concat(plugins);
    }
  },

  /**
   * Wait for some time.
   *
   * @param {number}[optional] time - Milliseconds to wait.
   */
  waitAlittle: function (time) {
    time = time || 3000;
    return Q.Promise(function (resolve, reject) {
      Q.delay(time).then(function () {
        resolve(true);
      });
    });
  },

  /*-------------------------------------------------------------------------*/

  // Join a channel
  join: function(channel) {
    var that = this;
    that.client.join(channel);
  },

  // Part from a channel
  part: function(channel, msg) {
    var that = this;
    that.client.part(channel, msg);
  },

  // Send message to a channel
  say: function(channel, msg) {
    var that = this;
    that.client.say(channel, msg);
  },

  // Send CTCP message to a channel
  ctcp: function(channel, type, msg) {
    var that = this;
    that.client.ctcp(channel, type, msg);
  },

  // Send an action message to a channel
  action: function(channel, msg) {
    var that = this;
    that.client.action(channel, msg);
  },

  // Send a notice to a channel
  notice: function(channel, msg) {
    var that = this;
    that.client.notice(channel, msg);
  },

  // Send a whois to a channel
  whois: function(nick, callback) {
    var that = this;
    that.client.whois(nick, function(nick) {
      callback.call(that, nick);
    });
  },

  // Connect to the server
  connect: function(retryCount, callback) {
    var that = this;
    that.client.connect(retryCount, function(input) {
      callback.call(that, input);
    });
  },

  // Disconnect from the server
  disconnect: function(message, callback) {
    var that = this;
    that.client.disconnect(message, function(input) {
      callback.call(that, input);
    });
  },

  // Kill the bot
  kill: function() {
    var that = this;
    that.client.disconnect('killed');
  },

  /*-------------------------------------------------------------------------*/

  /**
   * Adds 'registered' event listener.
   */
  addRegisteredListener: function(callback) {
    var that = this;
    that.client.addListener('registered', function(message) {
      callback.call(that, message);
    });
  },

  /**
   * Adds 'motd' event listener.
   */
  addMotdListener: function(callback) {
    var that = this;
    that.client.addListener('motd', function(motd) {
      callback.call(that, motd);
    });
  },

  /**
   * Adds 'names' event listener.
   */
  addNamesListener: function (callback) {
    var that = this;
    that.client.addListener('names', function(channel, nick) {
      callback.call(that, channel, nick);
    });
  },

  /**
   * Adds 'topic' event listener.
   */
  addTopicListener: function (callback) {
    var that = this;
    that.client.addListener('topic', function(channel, topic, nick) {
      callback.call(that, channel, topic, nick);
    });
  },

  /**
   * Adds 'join' event listener.
   */
  addJoinListener: function (callback) {
    var that = this;
    that.client.addListener('join', function(channel, nick) {
      callback.call(that, channel, nick);
    });
  },

  /**
   * Adds 'part' event listener.
   */
  addPartListener: function (callback) {
    var that = this;
    that.client.addListener('part', function(channel, nick, reason) {
      callback.call(that, channel, nick, reason);
    });
  },

  /**
   * Adds 'quit' event listener.
   */
  addQuitListener: function (callback) {
    var that = this;
    that.client.addListener('quit', function(nick, reason, channels) {
      callback.call(that, nick, reason, channels);
    });
  },

  /**
   * Adds 'kick' event listener.
   */
  addKickListener: function (callback) {
    var that = this;
    that.client.addListener('kick', function(channel, nick, by, reason) {
      callback.call(that, channel, nick, by, reason);
    });
  },

  /**
   * Adds 'kill' event listener.
   */
  addKillListener: function (callback) {
    var that = this;
    that.client.addListener('kill', function(nick, reason, channels) {
      callback.call(that, nick, reason, channels);
    });
  },

  /**
   * Adds 'message' event listener.
   */
  addMessageListener: function(callback) {
    var that = this;
    that.client.addListener('message', function(nick, to, text) {
      callback.call(that, nick, to, text);
    });
  },

  /**
   * Adds 'notice' event listener.
   */
  addNoticeListener: function (callback) {
    var that = this;
    that.client.addListener('notice', function(nick, to, text) {
      callback.call(that, nick, to, text);
    });
  },

  /**
   * Adds 'ping' event listener.
   */
  addPingListener: function (callback) {
    var that = this;
    that.client.addListener('ping', function(server) {
      callback.call(that, server);
    });
  },

  /**
   * Adds 'pm' event listener.
   */
  addPmListener: function (callback) {
    var that = this;
    that.client.addListener('pm', function(nick, text) {
      callback.call(that, nick, text);
    });
  },

  /**
   * Adds 'ctcp' event listener.
   */
  addCtcpListener: function (callback) {
    var that = this;
    that.client.addListener('ctcp', function(from, to, text, type) {
      callback.call(that, from, to, text, type);
    });
  },

  /**
   * Adds 'nick' event listener.
   */
  addNickListener: function (callback) {
    var that = this;
    that.client.addListener('nick', function(oldnick, newnick, channels) {
      callback.call(that, oldnick, newnick, channels);
    });
  },

  /**
   * Adds 'invite' event listener.
   */
  addInviteListener: function (callback) {
    var that = this;
    that.client.addListener('invite', function(channel, from) {
      callback.call(that, channel, from);
    });
  },

  /**
   * Adds '+mode' event listener.
   */
  addPlusModeListener: function (callback) {
    var that = this;
    that.client.addListener('+mode', function(channel, by, mode, argument) {
      callback.call(that, channel, by, mode, argument);
    });
  },

  /**
   * Adds '-mode' event listener.
   */
  addMinusModeListener: function (callback) {
    var that = this;
    that.client.addListener('-mode', function(channel, by, mode, argument) {
      callback.call(that, channel, by, mode, argument);
    });
  },

  /**
   * Adds 'whois' event listener.
   */
  addWhoisListener: function (callback) {
    var that = this;
    that.client.addListener('whois', function(info) {
      callback.call(that, info);
    });
  },

  /**
   * Adds 'channellist_start' event listener.
   */
  addChannellistStartListener: function (callback) {
    var that = this;
    that.client.addListener('channellist_start', function() {
      callback.call(that);
    });
  },

  /**
   * Adds 'channellist_item' event listener.
   */
  addChannellistItemListener: function (callback) {
    var that = this;
    that.client.addListener('channellist_item', function(channel_info) {
      callback.call(that, channel_info);
    });
  },

  /**
   * Adds 'channellist' event listener.
   */
  addChannellistListener: function (callback) {
    var that = this;
    that.client.addListener('channellist', function(channel_list) {
      callback.call(that, channel_list);
    });
  },

  /**
   * Adds 'error' event listener.
   */
  addErrorListener: function (callback) {
    var that = this;
    that.client.addListener('error', function(message) {
      callback.call(that, message);
    });
  }
};
