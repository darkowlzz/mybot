var Q = require('q');
var http = require('http');
var irc = require('irc');
var request = require('request');

var config = {
  channels: ['#hello'],
  server: '127.0.0.1',
  autoConnect: true
};

/**
 * Bot class
 */
function Bot(data) {
  var that = this;

  that.name = data.name || 'zoobot';
  that.network = data.network || '127.0.0.1';
  that.channel = config.channels[0];
  that.buffer = '';

  that.client = new irc.Client(config.server, that.name, {
    autoConnect: false
  });
}

Bot.prototype.connect = function() {
  var that = this;
  return Q.Promise(function(resolve, reject) {
    that.client.connect(5, function(input) {
      console.log('connected!');
      that.client.join(that.channel, function(input) {
        console.log('joined ' + that.channel);
        resolve('done');
      })
    });
  });
};

Bot.prototype.addMessageListener = function() {
  var that = this;
  that.client.addListener('message', function (from, to, text) {
    if (from !== that.name) {
      console.log('Storing in buffer: ' + text);
      that.buffer = text;
    }

    if (text.indexOf(that.name) > -1) {
      console.log(that.name + ': I was mentioned');
      if (text.indexOf('hi') > -1) {
        console.log(that.name + ': replying...');
        that.say('hello there ' + from);
      }
    }
  });
};

Bot.prototype.say = function(msg) {
  var that = this;
  that.client.say(config.channels[0], msg);
};

Bot.prototype.kill = function() {
  var that = this;
  that.client.disconnect('killed');
};
module.exports = Bot;
