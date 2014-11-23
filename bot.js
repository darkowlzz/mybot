module.exports = Bot;

var Q = require('q');
var http = require('http');
var irc = require('irc');
var request = require('request');
var _ = require('underscore');
var AIMLInterpreter = require('aimlinterpreter');


/**
 * Bot class
 */
function Bot(config) {
  var that = this;

  that.nick = config.nick || 'zoobot';
  that.network = config.server || '127.0.0.1';
  that.channels = config.channels;
  that.buffer = {};
  that.channels.forEach(function(channel, index) {
    that.buffer[channel] = '';
  });

  that.client = new irc.Client(that.network, that.nick, {
    autoConnect: false
  });
  that.addErrorListener();
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

// Add message listener
Bot.prototype.addMessageListener = function() {
  var that = this;
  that.client.addListener('message', function (from, to, text) {
    if (from !== that.nick) {
      that.buffer[to] = text;
    }

    if (text.indexOf(that.nick) > -1) {
      if (text.indexOf('hi') > -1) {
        that.say(to, 'hello there ' + from);
      }
    }
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
    console.log('error: ', message);
  });
};

/**
 * Add custom listener
 *
 * @param {String} event
 *    event to listen
 * @param {function} callback
 *    action to be performed
 */
Bot.prototype.addCustomMessageListener = function(event, callback) {
  var that = this;
  that.client.addListener(event, function (from, to, text) {
    callback.call(that, from, to, text);
  });
};

// Send message to a channel
Bot.prototype.say = function(channel, msg) {
  var that = this;
  that.client.say(channel, msg);
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

/**
 * LoadAIML
 *
 * @param {Object} option
 *    If no argument is passed, the default aiml files are loaded.
 *    The argument should be a list of filepath to be loaded.
 *    e.g.: ['file1.aiml', 'file2.aiml']
 */
Bot.prototype.loadAIML = function(option) {
  var aimlFiles;
  if (option === undefined) {
    option = 'all';
  }
  else if (typeof(option) === 'object') {
    aimlFiles = option;
  }
  var that = this;
  var aimlInterpreter = new AIMLInterpreter({name: that.nick});

  if (option === 'all') {
    aimlFiles = fs.readdirSync('./aiml/');
    aimlFiles = _.map(aimlFiles, function(file){ return './aiml/' + file});
    aimlInterpreter.loadAIMLFilesIntoArray(aimlFiles);
  }
  else {
    aimlInterpreter.loadAIMLFilesIntoArray(aimlFiles);
  }

  that.addCustomMessageListener('message', function(from, to, text) {
    var self = this;
    if (text.indexOf(self.nick) > -1) {
      text = text.split(':');
      text.shift();
      text = text.join(':');
      aimlInterpreter.findAnswerInLoadedAIMLFiles(
          text, function(answer, wildCardArray) {
            self.say(to, from + ': ' + answer);
          });
    }
  });
};
