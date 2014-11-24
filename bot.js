'use strict';

module.exports = Bot;

var Q = require('q');
var http = require('http');
var irc = require('irc');
var request = require('request');
var _ = require('underscore');
var AIMLInterpreter = require('aimlinterpreter');
var Datastore = require('nedb');
var fortune = require('fortune-teller');


/**
 * Bot class
 */
function Bot(config) {
  var that = this;

  that.nick = config.nick || 'zoobot';
  that.network = config.server || '127.0.0.1';
  that.channels = config.channels;
  that.plugins = config.plugins || null;
  that.help = {};
  that.buffer = {};
  that.channels.forEach(function(channel, index) {
    that.buffer[channel] = '';
  });

  that.client = new irc.Client(that.network, that.nick, {
    autoConnect: false
  });
  that.addMessageListener();
  that.addHelpListener();
  that.addErrorListener();

  var plugins = {
    'joinListener': function() {
      return that.addJoinListener();
    },

    'partListener': function() {
      return that.addPartListener();
    },

    'loadAIML': function() {
      return that.loadAIML();
    },

    'remember': function() {
      return that.remember();
    },

    'cookies': function() {
      return that.fortune();
    }
  };

  try {
    that.plugins.forEach(function(plugin, index) {
      console.log('loading ' + plugin);
      that.help[plugin] = plugins[plugin]();
    });
  }
  catch(e) {}
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


// Help listener
Bot.prototype.addHelpListener = function() {
  var that = this;
  that.addCustomMessageListener('message', function (from, to, text) {
    var self = this;
    var tempText = text.split(' ');
    if (_.first(tempText).indexOf(self.nick) > -1) {
      text = text.split(' ');
      text.shift();
      if (text[0] === '!help') {
        try {
          self.say(to, from + ': ' + self.help[text[1]]);
        }
        catch(e) {
          self.say(to, from + ': plugin not found');
        }
      }
    }
  });
};


// Add message listener
Bot.prototype.addMessageListener = function() {
  var help = 'addMessageListener:\n' +
             'Enables listening to all the messages in all the channels' +
             ' (excluding own messages).\n' +
             'Commands:\n' +
             'hi - replies with greetings message\n' +
             'help - replies with help instructions';

  var that = this;
  that.addCustomMessageListener('message', function (from, to, text) {
    var self = this;
    if (from !== self.nick) {
      self.buffer[to] = text;
    }

    text = text.split(' ');
    if (_.first(text).indexOf(self.nick) > -1) {
      if (text[1] == 'hi') {
        self.say(to, 'hello there ' + from);
      }
      else if (text[1] == 'help') {
        var helpText = 'Need help? Query help on any of the ' +
                       'loaded plugins as\n' +
                       '<mynick> !help <pluginName>\n';
        var listPlugins = 'Following are the available plugins:\n';
        self.plugins.forEach(function(plugin) {
          listPlugins += plugin + ' ';
        })
        self.say(to, from + ': ' + helpText + listPlugins);
      }
    }
  });
  return help;
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
    aimlFiles = _.map(aimlFiles, function(file){ return './aiml/' + file;});
    aimlInterpreter.loadAIMLFilesIntoArray(aimlFiles);
  }
  else {
    aimlInterpreter.loadAIMLFilesIntoArray(aimlFiles);
  }

  that.addCustomMessageListener('message', function(from, to, text) {
    var self = this;
    var tempText = text.split(' ');
    // checking just the first word to avoid mid sentence mentions
    if (_.first(tempText).indexOf(self.nick.toLowerCase()) > -1) {
      text = text.split(':');  // get rid of mentioned name
      text.shift();
      text = text.join(':').trim();
      aimlInterpreter.findAnswerInLoadedAIMLFiles(
          text, function(answer, wildCardArray) {
            self.say(to, from + ': ' + answer);
          });
    }
  });
};


/**
 * Remember definition
 */
Bot.prototype.remember = function(option) {
  var help = 'remember: \n' +
             'This plugin enables the bot to remember definitions.\n' +
             'Remember Syntax:\n'+
             '<botname> !remember <foo> is <bar>\n' +
             'Recall Syntax:\n' +
             '<botname> <foo>?';

  var that = this,
      file;
  if (typeof(option) == 'string') {
    file = option;
  }
  else {
    file = './remember.db';
  }

  var db = new Datastore({ filename: file, autoload: true});

  that.addCustomMessageListener('message', function(from, to, text) {
    text = text.toLowerCase();
    var self = this;
    var tempText = text.split(' ');
    if (_.first(tempText).indexOf(self.nick.toLowerCase()) > -1) {
      // Look for the pattern "remember x is y"
      if (tempText[1].indexOf('!remember') > -1) {
        text = text.split('!remember');
        text = text[1].trim();
        tempText = text.split(' is ');  // split "x is y"
        var key = tempText[0].trim();  // key = x
        tempText.shift();
        var value = tempText.join(' is ').trim();  // value = y
        var doc = {string: key, answer: value};
        try {
          db.insert(doc, function(err) {
            if (err) {
              console.log(err);
            }
            else {
              self.say(to, from + ': ok!');
            }
          });
        }
        catch(e) {
          console.log(e);
        }
      }
      else if (text.slice(-1) == '?'){
        text = text.split(' ');
        text.shift();
        text = text.join(' ').trim().slice(0, -1);
        try {
          db.findOne({string: text}, function(err, doc) {
            if (err) {
              console.log(err);
            }
            else {
              if (doc !== null) {
                self.say(to, doc.answer);
              }
              else {
                self.say(to, 'huh?');
              }
            }
          });
        }
        catch(e) {
          console.log(e);
        }
      }
    }
  });
  return help;
};


/**
 * Fortune cookies
 */
Bot.prototype.fortune = function() {
  var help = 'fortune:\n' +
             'This plugin helps the bot to retrieve fortunes.\n' +
             'Syntax: \n' +
             '<botname> !cookie'

  var that = this;
  that.addCustomMessageListener('message', function(from, to, text) {
    text = text.toLowerCase();
    var self = this;
    var tempText = text.split(' ');
    if (_.first(tempText).indexOf(self.nick.toLowerCase()) > -1) {
      if (tempText[1].indexOf('!cookie') > -1) {
        self.say(to, fortune.fortune());
      }
    }
  });
  return help;
};
